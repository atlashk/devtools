import type { CronState, FieldState } from "../types";

function every(): FieldState {
  return { mode: "every", step: 1, rangeStart: 0, rangeEnd: 0, specific: [] };
}

function at(value: number): FieldState {
  return { mode: "specific", step: 1, rangeStart: 0, rangeEnd: 0, specific: [value] };
}

export type CronPreset = {
  label: string;
  build: () => CronState;
};

export const CRON_PRESETS: CronPreset[] = [
  {
    label: "Every minute",
    build: () => ({
      minute: every(),
      hour: every(),
      dayOfMonth: every(),
      month: every(),
      dayOfWeek: every(),
    }),
  },
  {
    label: "Hourly",
    build: () => ({
      minute: at(0),
      hour: every(),
      dayOfMonth: every(),
      month: every(),
      dayOfWeek: every(),
    }),
  },
  {
    label: "Daily at midnight",
    build: () => ({
      minute: at(0),
      hour: at(0),
      dayOfMonth: every(),
      month: every(),
      dayOfWeek: every(),
    }),
  },
  {
    label: "Weekly (Mon)",
    build: () => ({
      minute: at(0),
      hour: at(0),
      dayOfMonth: every(),
      month: every(),
      dayOfWeek: at(1),
    }),
  },
  {
    label: "Monthly (1st)",
    build: () => ({
      minute: at(0),
      hour: at(0),
      dayOfMonth: at(1),
      month: every(),
      dayOfWeek: every(),
    }),
  },
  {
    label: "Yearly (Jan 1)",
    build: () => ({
      minute: at(0),
      hour: at(0),
      dayOfMonth: at(1),
      month: at(1),
      dayOfWeek: every(),
    }),
  },
];
