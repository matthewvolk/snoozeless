import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import type { ErrorResponse, WakeTimeResponse } from "../src/types";

describe("POST /v1/wake-times", () => {
  it("returns 400 for missing now field", async () => {
    const response = await SELF.fetch("http://localhost/v1/wake-times", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(400);
    const data = (await response.json()) as ErrorResponse;
    expect(data.error).toBeDefined();
    expect(data.error.code).toBe("MISSING_FIELD");
  });

  it("returns 400 for invalid JSON", async () => {
    const response = await SELF.fetch("http://localhost/v1/wake-times", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });

    expect(response.status).toBe(400);
    const data = (await response.json()) as ErrorResponse;
    expect(data.error).toBeDefined();
    expect(data.error.code).toBe("INVALID_JSON");
  });

  it("returns 400 for timestamp without offset", async () => {
    const response = await SELF.fetch("http://localhost/v1/wake-times", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ now: "2026-01-25T22:43:00" }),
    });

    expect(response.status).toBe(400);
    const data = (await response.json()) as ErrorResponse;
    expect(data.error).toBeDefined();
    expect(data.error.code).toBe("MISSING_OFFSET");
  });

  it("returns 400 for invalid timestamp format", async () => {
    const response = await SELF.fetch("http://localhost/v1/wake-times", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ now: "not-a-date" }),
    });

    expect(response.status).toBe(400);
    const data = (await response.json()) as ErrorResponse;
    expect(data.error).toBeDefined();
    expect(data.error.code).toBe("MISSING_OFFSET");
  });

  it("returns all required fields in each option", async () => {
    const response = await SELF.fetch("http://localhost/v1/wake-times", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ now: "2026-01-25T22:43:00-06:00" }),
    });

    const data = (await response.json()) as WakeTimeResponse;
    for (const option of data.options) {
      expect(option).toHaveProperty("iso");
      expect(option).toHaveProperty("local");
      expect(option).toHaveProperty("minutesFromNow");
      expect(option).toHaveProperty("totalSleepMinutes");
      expect(option).toHaveProperty("cycles");
      expect(option).toHaveProperty("label");
    }
  });
});
