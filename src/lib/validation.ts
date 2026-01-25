export interface ValidationResult {
  valid: true;
  date: Date;
  offset: string;
}

export interface ValidationError {
  valid: false;
  code: string;
  message: string;
}

export type ValidationOutcome = ValidationResult | ValidationError;

const OFFSET_REGEX = /([+-]\d{2}:\d{2})$/;
const Z_SUFFIX_REGEX = /Z$/i;

export function validateTimestamp(input: unknown): ValidationOutcome {
  if (typeof input !== "string") {
    return {
      valid: false,
      code: "INVALID_FORMAT",
      message: "Timestamp must be a string",
    };
  }

  if (input.trim() === "") {
    return {
      valid: false,
      code: "INVALID_FORMAT",
      message: "Timestamp cannot be empty",
    };
  }

  let offset: string;

  if (Z_SUFFIX_REGEX.test(input)) {
    offset = "+00:00";
  } else {
    const match = input.match(OFFSET_REGEX);
    if (!match) {
      return {
        valid: false,
        code: "MISSING_OFFSET",
        message:
          "Timestamp must include an explicit timezone offset (e.g., -06:00 or Z)",
      };
    }
    offset = match[1];
  }

  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return {
      valid: false,
      code: "INVALID_FORMAT",
      message: "Timestamp is not a valid ISO-8601 date",
    };
  }

  return {
    valid: true,
    date,
    offset,
  };
}
