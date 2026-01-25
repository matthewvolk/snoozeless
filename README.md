# snoozeless

A Cloudflare Workers API that calculates optimal wake times based on sleep cycles.

## How It Works

The API calculates wake times by:

- Adding a 15-minute sleep onset latency
- Calculating wake times at the end of complete 90-minute sleep cycles
- Returning 5 options for 7, 6, 5, 4, and 3 full cycles

## Setup

```bash
pnpm install
```

## Development

```bash
pnpm dev        # Start local dev server
pnpm test       # Run tests
pnpm check      # Check linting/formatting
pnpm fix        # Fix linting/formatting issues
pnpm typecheck  # Type check
```

## API

### POST /v1/wake-times

Calculate optimal wake times from a given bedtime.

**Request:**

```bash
curl -X POST http://localhost:8787/v1/wake-times \
  -H "Content-Type: application/json" \
  -d '{"now": "2026-01-25T22:43:00-06:00"}'
```

The `now` field must be an ISO-8601 timestamp with an explicit timezone offset (e.g., `-06:00` or `Z`).

**Response:**

```json
{
  "options": [
    {
      "iso": "2026-01-26T09:28-06:00",
      "local": "9:28 AM",
      "minutesFromNow": 645,
      "totalSleepMinutes": 630,
      "cycles": 7,
      "label": "9:28 AM (10h 30m, 7 cycles)"
    },
    {
      "iso": "2026-01-26T07:58-06:00",
      "local": "7:58 AM",
      "minutesFromNow": 555,
      "totalSleepMinutes": 540,
      "cycles": 6,
      "label": "7:58 AM (9h 0m, 6 cycles)"
    },
    {
      "iso": "2026-01-26T06:28-06:00",
      "local": "6:28 AM",
      "minutesFromNow": 465,
      "totalSleepMinutes": 450,
      "cycles": 5,
      "label": "6:28 AM (7h 30m, 5 cycles)"
    },
    {
      "iso": "2026-01-26T04:58-06:00",
      "local": "4:58 AM",
      "minutesFromNow": 375,
      "totalSleepMinutes": 360,
      "cycles": 4,
      "label": "4:58 AM (6h 0m, 4 cycles)"
    },
    {
      "iso": "2026-01-26T03:28-06:00",
      "local": "3:28 AM",
      "minutesFromNow": 285,
      "totalSleepMinutes": 270,
      "cycles": 3,
      "label": "3:28 AM (4h 30m, 3 cycles)"
    }
  ]
}
```

## Deploy

```bash
pnpm deploy
```
