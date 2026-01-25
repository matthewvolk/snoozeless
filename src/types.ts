export interface WakeTimeRequest {
  now: string;
}

export interface WakeTimeOption {
  iso: string;
  local: string;
  minutesFromNow: number;
  totalSleepMinutes: number;
  cycles: number;
  label: string;
}

export interface WakeTimeResponse {
  options: WakeTimeOption[];
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
