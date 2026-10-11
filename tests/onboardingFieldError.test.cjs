const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

const source = fs.readFileSync(
  path.join(__dirname, "../src/features/onboarding/resolveOnboardingFieldError.ts"),
  "utf8",
);
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const helpers = {};
vm.runInNewContext(compiled, { exports: helpers, require });
const resolveOnboardingFieldError = helpers.default;

const screenWith = (...names) => ({
  fields: names.map((name) => ({ name })),
});

const apiError = (message) =>
  Object.assign(new Error(message), {
    isAxiosError: true,
    response: { data: { message } },
  });

const assertFieldError = (actual, expected) =>
  assert.deepEqual(actual && { ...actual }, expected);

test("duplicate index errors map to the matching onboarding field", () => {
  const error = apiError(
    'E11000 duplicate key error collection: users index: profile.email_1 dup key: { email: "used@example.com" }',
  );

  assertFieldError(
    resolveOnboardingFieldError(error, screenWith("email")),
    {
      fieldName: "email",
      message: "This email is already in use. Please use another.",
    },
  );
});

test("duplicate phone errors use a matching field when index details are absent", () => {
  const error = apiError("E11000 duplicate key: phone number already exists");

  assertFieldError(
    resolveOnboardingFieldError(error, screenWith("phoneNumber")),
    {
      fieldName: "phoneNumber",
      message: "This phone number is already in use. Please use another.",
    },
  );
});

test("referral errors attach to the referral field and keep the API message", () => {
  const error = apiError("Referral code is expired");

  assertFieldError(
    resolveOnboardingFieldError(error, screenWith("referralCode")),
    { fieldName: "referralCode", message: "Referral code is expired" },
  );
});

test("unmatched errors do not attach to a field", () => {
  assert.equal(
    resolveOnboardingFieldError(new Error("network unavailable"), screenWith("email")),
    null,
  );
});
