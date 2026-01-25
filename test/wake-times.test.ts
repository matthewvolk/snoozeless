import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import type { ErrorResponse, WakeTimeResponse } from "../src/types";

describe("POST /v1/wake-times", () => {
  it("returns exactly 5 wake time options", async () => {
    const response = await SELF.fetch("http://localhost/v1/wake-times", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ now: "2026-01-25T22:43:00-06:00" }),
    });

    expect(response.status).toBe(200);
    const data = (await response.json()) as WakeTimeResponse;
    expect(data.options).toHaveLength(5);
  });

  it("returns options ordered by cycles [7, 6, 5, 4, 3]", async () => {
    const response = await SELF.fetch("http://localhost/v1/wake-times", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ now: "2026-01-25T22:43:00-06:00" }),
    });

    const data = (await response.json()) as WakeTimeResponse;
    const cycles = data.options.map((opt) => opt.cycles);
    expect(cycles).toEqual([7, 6, 5, 4, 3]);
  });

  it("has middle option (index 2) with 5 cycles", async () => {
    const response = await SELF.fetch("http://localhost/v1/wake-times", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ now: "2026-01-25T22:43:00-06:00" }),
    });

    const data = (await response.json()) as WakeTimeResponse;
    expect(data.options[2].cycles).toBe(5);
  });

  it("formats ISO output without seconds", async () => {
    const response = await SELF.fetch("http://localhost/v1/wake-times", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ now: "2026-01-25T22:43:00-06:00" }),
    });

    const data = (await response.json()) as WakeTimeResponse;
    for (const option of data.options) {
      // ISO format should be YYYY-MM-DDTHH:mm±HH:mm (no seconds)
      expect(option.iso).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}[+-]\d{2}:\d{2}$/,
      );
    }
  });

  it("formats local output as 12-hour time with AM/PM", async () => {
    const response = await SELF.fetch("http://localhost/v1/wake-times", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ now: "2026-01-25T22:43:00-06:00" }),
    });

    const data = (await response.json()) as WakeTimeResponse;
    for (const option of data.options) {
      expect(option.local).toMatch(/^\d{1,2}:\d{2} (AM|PM)$/);
    }
  });

  it("preserves the original timezone offset in output", async () => {
    const response = await SELF.fetch("http://localhost/v1/wake-times", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ now: "2026-01-25T22:43:00-06:00" }),
    });

    const data = (await response.json()) as WakeTimeResponse;
    for (const option of data.options) {
      expect(option.iso).toContain("-06:00");
    }
  });

  it("handles Z timezone offset as UTC", async () => {
    const response = await SELF.fetch("http://localhost/v1/wake-times", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ now: "2026-01-25T22:43:00Z" }),
    });

    expect(response.status).toBe(200);
    const data = (await response.json()) as WakeTimeResponse;
    for (const option of data.options) {
      expect(option.iso).toContain("+00:00");
    }
  });

  it("calculates correct wake times for 5 cycles", async () => {
    const response = await SELF.fetch("http://localhost/v1/wake-times", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ now: "2026-01-25T22:43:00-06:00" }),
    });

    const data = (await response.json()) as WakeTimeResponse;
    const fiveCycleOption = data.options.find((opt) => opt.cycles === 5);

    // 5 cycles = 450 minutes sleep + 15 onset = 465 minutes from now
    expect(fiveCycleOption?.minutesFromNow).toBe(465);
    expect(fiveCycleOption?.totalSleepMinutes).toBe(450);
    // 22:43 + 465 minutes = 6:28 AM next day
    expect(fiveCycleOption?.local).toBe("6:28 AM");
    expect(fiveCycleOption?.iso).toBe("2026-01-26T06:28-06:00");
  });

  it("formats label correctly", async () => {
    const response = await SELF.fetch("http://localhost/v1/wake-times", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ now: "2026-01-25T22:43:00-06:00" }),
    });

    const data = (await response.json()) as WakeTimeResponse;
    const fiveCycleOption = data.options.find((opt) => opt.cycles === 5);

    expect(fiveCycleOption?.label).toBe("6:28 AM (7h 30m, 5 cycles)");
  });

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
