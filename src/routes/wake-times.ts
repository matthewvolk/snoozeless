import type { Context } from "hono";
import { calculateWakeTimes } from "../lib/sleep";
import { validateTimestamp } from "../lib/validation";
import type {
  ErrorResponse,
  WakeTimeRequest,
  WakeTimeResponse,
} from "../types";

export async function wakeTimesHandler(c: Context) {
  let body: WakeTimeRequest;

  try {
    body = await c.req.json();
  } catch {
    const error: ErrorResponse = {
      error: {
        code: "INVALID_JSON",
        message: "Request body must be valid JSON",
      },
    };
    return c.json(error, 400);
  }

  if (!body.now) {
    const error: ErrorResponse = {
      error: {
        code: "MISSING_FIELD",
        message: "Field 'now' is required",
      },
    };
    return c.json(error, 400);
  }

  const validation = validateTimestamp(body.now);

  if (!validation.valid) {
    const error: ErrorResponse = {
      error: {
        code: validation.code,
        message: validation.message,
      },
    };
    return c.json(error, 400);
  }

  const options = calculateWakeTimes(validation.date, validation.offset);

  const response: WakeTimeResponse = { options };
  return c.json(response);
}
