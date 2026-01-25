import type { WakeTimeOption } from "../types";

const CYCLE_LENGTH_MINUTES = 90;
const ONSET_LATENCY_MINUTES = 15;
const CYCLES_TO_RETURN = [7, 6, 5, 4, 3];

export function calculateWakeTimes(
  now: Date,
  offset: string,
): WakeTimeOption[] {
  return CYCLES_TO_RETURN.map((cycles) => {
    const totalSleepMinutes = cycles * CYCLE_LENGTH_MINUTES;
    const minutesFromNow = ONSET_LATENCY_MINUTES + totalSleepMinutes;
    const wakeTime = new Date(now.getTime() + minutesFromNow * 60 * 1000);

    const iso = formatWithOffset(wakeTime, offset);
    const local = formatLocalTime(wakeTime, offset);
    const label = formatLabel(local, totalSleepMinutes, cycles);

    return {
      iso,
      local,
      minutesFromNow,
      totalSleepMinutes,
      cycles,
      label,
    };
  });
}

function formatWithOffset(date: Date, offset: string): string {
  const offsetMinutes = parseOffsetMinutes(offset);
  const localTime = new Date(date.getTime() + offsetMinutes * 60 * 1000);

  const year = localTime.getUTCFullYear();
  const month = String(localTime.getUTCMonth() + 1).padStart(2, "0");
  const day = String(localTime.getUTCDate()).padStart(2, "0");
  const hours = String(localTime.getUTCHours()).padStart(2, "0");
  const minutes = String(localTime.getUTCMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}${offset}`;
}

function formatLocalTime(date: Date, offset: string): string {
  const offsetMinutes = parseOffsetMinutes(offset);
  const localTime = new Date(date.getTime() + offsetMinutes * 60 * 1000);

  const hour24 = localTime.getUTCHours();
  const minutes = String(localTime.getUTCMinutes()).padStart(2, "0");
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;

  return `${hour12}:${minutes} ${period}`;
}

function parseOffsetMinutes(offset: string): number {
  const sign = offset.startsWith("-") ? -1 : 1;
  const [hours, minutes] = offset.slice(1).split(":").map(Number);
  return sign * (hours * 60 + minutes);
}

function formatLabel(
  local: string,
  totalSleepMinutes: number,
  cycles: number,
): string {
  const hours = Math.floor(totalSleepMinutes / 60);
  const minutes = totalSleepMinutes % 60;
  return `${local} (${hours}h ${minutes}m, ${cycles} cycles)`;
}
