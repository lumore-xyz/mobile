import { z } from "zod/mini";
import isValidOptionValue from "./isValidOptionValue";

export default function max5OptionArraySchema(
  options: { value: string }[],
  message: string,
  maxMessage?: string,
) {
  return z.array(z.string()).check(
    maxMessage
      ? z.maxLength(5, maxMessage)
      : z.maxLength(5),
    z.refine(
      (values) => values.every((value) => isValidOptionValue(value, options)),
      message,
    ),
  );
}
