import { describe, expect, it } from "vitest";
import {
  calculateWakeTimes,
  formatLabel,
  formatLocalTime,
  formatWithOffset,
} from "./sleep";

describe("calculateWakeTimes", () => {
  describe("wake time options", () => {
    it("returns exactly 5 options", () => {
      const now = new Date("2026-01-25T22:43:00Z");
      const options = calculateWakeTimes(now, "-06:00");
      expect(options).toHaveLength(5);
    });

    it("returns options ordered by cycles [7, 6, 5, 4, 3]", () => {
      const now = new Date("2026-01-25T22:43:00Z");
      const options = calculateWakeTimes(now, "-06:00");
      const cycles = options.map((opt) => opt.cycles);
      expect(cycles).toEqual([7, 6, 5, 4, 3]);
    });

    it("has middle option (index 2) with 5 cycles", () => {
      const now = new Date("2026-01-25T22:43:00Z");
      const options = calculateWakeTimes(now, "-06:00");
      expect(options[2].cycles).toBe(5);
    });
  });

  describe("time calculations", () => {
    it("calculates correct wake times for 5 cycles", () => {
      const now = new Date("2026-01-26T04:43:00Z"); // 22:43 CST = 04:43 UTC
      const options = calculateWakeTimes(now, "-06:00");
      const fiveCycleOption = options.find((opt) => opt.cycles === 5);

      // 5 cycles = 450 minutes sleep + 15 onset = 465 minutes from now
      expect(fiveCycleOption?.minutesFromNow).toBe(465);
      expect(fiveCycleOption?.totalSleepMinutes).toBe(450);
      // 22:43 + 465 minutes = 6:28 AM next day
      expect(fiveCycleOption?.local).toBe("6:28 AM");
      expect(fiveCycleOption?.iso).toBe("2026-01-26T06:28-06:00");
    });
  });
});

describe("formatWithOffset", () => {
  it("formats ISO without seconds", () => {
    const date = new Date("2026-01-26T12:28:00Z");
    const result = formatWithOffset(date, "-06:00");
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
  });

  it("preserves timezone offset in output", () => {
    const date = new Date("2026-01-26T12:28:00Z");
    const result = formatWithOffset(date, "-06:00");
    expect(result).toContain("-06:00");
  });

  it("converts UTC time to local time correctly", () => {
    const date = new Date("2026-01-26T12:28:00Z"); // 12:28 UTC
    const result = formatWithOffset(date, "-06:00"); // -6 hours
    expect(result).toBe("2026-01-26T06:28-06:00"); // 06:28 CST
  });
});

describe("formatLocalTime", () => {
  it("formats 12-hour time with AM/PM", () => {
    const date = new Date("2026-01-26T12:28:00Z");
    const result = formatLocalTime(date, "-06:00");
    expect(result).toMatch(/^\d{1,2}:\d{2} (AM|PM)$/);
  });

  it("formats morning time with AM", () => {
    const date = new Date("2026-01-26T12:28:00Z"); // 06:28 CST
    const result = formatLocalTime(date, "-06:00");
    expect(result).toBe("6:28 AM");
  });

  it("formats afternoon time with PM", () => {
    const date = new Date("2026-01-26T20:30:00Z"); // 14:30 CST
    const result = formatLocalTime(date, "-06:00");
    expect(result).toBe("2:30 PM");
  });

  it("formats midnight as 12:xx AM", () => {
    const date = new Date("2026-01-26T06:00:00Z"); // 00:00 CST
    const result = formatLocalTime(date, "-06:00");
    expect(result).toBe("12:00 AM");
  });

  it("formats noon as 12:xx PM", () => {
    const date = new Date("2026-01-26T18:00:00Z"); // 12:00 CST
    const result = formatLocalTime(date, "-06:00");
    expect(result).toBe("12:00 PM");
  });
});

describe("formatLabel", () => {
  it("formats label correctly", () => {
    const result = formatLabel("6:28 AM", 450, 5);
    expect(result).toBe("6:28 AM (7h 30m, 5 cycles)");
  });

  it("includes hours and minutes from totalSleepMinutes", () => {
    const result = formatLabel("8:58 AM", 600, 7);
    expect(result).toBe("8:58 AM (10h 0m, 7 cycles)");
  });
});
