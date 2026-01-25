import { describe, expect, it } from "vitest";
import { validateTimestamp } from "./validation";

describe("validateTimestamp", () => {
  describe("valid inputs", () => {
    it("handles Z timezone as UTC (+00:00)", () => {
      const result = validateTimestamp("2026-01-25T22:43:00Z");
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.offset).toBe("+00:00");
      }
    });

    it("accepts positive timezone offsets", () => {
      const result = validateTimestamp("2026-01-25T22:43:00+05:30");
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.offset).toBe("+05:30");
      }
    });

    it("accepts negative timezone offsets", () => {
      const result = validateTimestamp("2026-01-25T22:43:00-06:00");
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.offset).toBe("-06:00");
      }
    });

    it("returns a valid Date object", () => {
      const result = validateTimestamp("2026-01-25T22:43:00-06:00");
      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.date).toBeInstanceOf(Date);
        expect(result.date.getTime()).not.toBeNaN();
      }
    });
  });

  describe("invalid inputs", () => {
    it("rejects non-string input", () => {
      const result = validateTimestamp(123);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.code).toBe("INVALID_FORMAT");
      }
    });

    it("rejects empty string", () => {
      const result = validateTimestamp("");
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.code).toBe("INVALID_FORMAT");
      }
    });

    it("rejects timestamp without offset", () => {
      const result = validateTimestamp("2026-01-25T22:43:00");
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.code).toBe("MISSING_OFFSET");
      }
    });

    it("rejects invalid date format", () => {
      const result = validateTimestamp("not-a-date");
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.code).toBe("MISSING_OFFSET");
      }
    });
  });
});
