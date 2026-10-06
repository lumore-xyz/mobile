const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../src/features/explore/state.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const helpers = {};
vm.runInNewContext(compiled, { exports: helpers, Date, Number, Boolean });

test('Retry-After handles seconds, HTTP dates and absent values', () => {
  const now = Date.parse('2026-10-03T12:00:00Z');
  assert.equal(helpers.getRetryAfterMs('3', now), 3000);
  assert.equal(helpers.getRetryAfterMs('Sat, 03 Oct 2026 12:01:00 GMT', now), 60000);
  assert.equal(helpers.getRetryAfterMs(undefined, now), 3000);
  assert.equal(helpers.getRetryAfterMs('invalid', now), 3000);
  assert.equal(helpers.getRetryAfterMs('-1', now), 1000);
});

test('cached cards expire exactly at the UTC reset, regardless of local timezone', () => {
  const reset = '2026-10-04T00:00:00Z';
  assert.equal(helpers.isExploreExpired(reset, Date.parse('2026-10-04T05:29:59+05:30')), false);
  assert.equal(helpers.isExploreExpired(reset, Date.parse('2026-10-04T05:30:00+05:30')), true);
  assert.equal(helpers.isExploreExpired(undefined), false);
});

test('errors offer the matching recovery action', () => {
  const error = (code, status = 409) => ({ response: { status, data: { code } } });
  assert.equal(helpers.getExploreErrorAction(error('INSUFFICIENT_CREDITS')), 'credits');
  assert.equal(helpers.getExploreErrorAction(error('INCOMPLETE_PROFILE', 400)), 'profile');
  assert.equal(helpers.getExploreErrorAction(error('INVALID_AGE_PREFERENCE', 400)), 'preferences');
  assert.equal(helpers.getExploreErrorAction(error('', 401)), 'login');
  assert.equal(helpers.getExploreErrorAction(error('EXPLORE_PAYMENT_PENDING', 503)), 'retry');
});
