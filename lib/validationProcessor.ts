import { ZodSchema, ZodError } from "zod";

/**
 * Processes the Zod validation errors and returns a user-friendly list of error messages.
 * @param error - The ZodError object.
 * @returns A list of error messages describing the validation issues.
 */
function processZodErrors(error: ZodError): string[] {
  const errorMessages: string[] = [];

  error.errors.forEach((err) => {
    const fieldPath = err.path.join(".");
    switch (err.code) {
      case "invalid_type":
        errorMessages.push(
          `Type mismatch on key "${fieldPath}": expected ${
            err.expected
          }, received ${typeof err.received}`
        );
        break;
      case "too_small":
        errorMessages.push(
          `Field "${fieldPath}" is missing or empty (minimum required length: ${err.minimum})`
        );
        break;
      case "invalid_enum_value":
        errorMessages.push(
          `Field "${fieldPath}" has an invalid value. Expected one of: ${err.options.join(
            ", "
          )}`
        );
        break;
      default:
        errorMessages.push(
          `Validation error on key "${fieldPath}": ${err.message}`
        );
    }
  });

  return errorMessages;
}

/**
 * Checks if a variable matches a specific Zod schema and returns detailed errors for type mismatches and missing fields.
 * @param data - The variable to validate.
 * @param schema - The Zod schema to validate against.
 * @returns A tuple: [isValid (boolean), errors (array of error messages)]
 */
export function isOfTypeWithErrors<T>(
  data: unknown,
  schema: ZodSchema<T>
): [boolean, string[]] {
  try {
    schema.parse(data);
    return [true, []];
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = processZodErrors(error);
      return [false, errorMessages];
    }

    return [false, ["Validation failed due to an unknown error"]];
  }
}

export class ValidationError extends Error {
  constructor(public errors: string[]) {
    super("Validation failed");
    this.name = "ValidationError";
  }
}
