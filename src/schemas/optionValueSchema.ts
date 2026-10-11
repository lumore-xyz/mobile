import { z } from "zod/mini";
import isValidOptionValue from "./isValidOptionValue";

export default function optionValueSchema(
  options: { value: string }[],
  message: string,
  extras: string[] = [],
) {
  return z.string().check(
    z.refine((value) => isValidOptionValue(value, options, extras), message),
  );
}
