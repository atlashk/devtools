import type { CronFieldKey, CronState, FieldState } from "../types";

export type FieldConfig = {
  key: CronFieldKey;
  label: string;
  min: number;
  max: number;
  singular: string;
  valueLabels?: Record<number, string>;
};

const MONTH_LABELS: Record<number, string> = {
  1: "Jan",
  2: "Feb",
  3: "Mar",
  4: "Apr",
  5: "May",
  6: "Jun",
  7: "Jul",
  8: "Aug",
  9: "Sep",
  10: "Oct",
  11: "Nov",
  12: "Dec",
};

const WEEKDAY_LABELS: Record<number, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

export const FIELD_ORDER: CronFieldKey[] = [
  "minute",
  "hour",
  "dayOfMonth",
  "month",
  "dayOfWeek",
];

export const FIELD_CONFIGS: Record<CronFieldKey, FieldConfig> = {
  minute: { key: "minute", label: "Minute", min: 0, max: 59, singular: "minute" },
  hour: { key: "hour", label: "Hour", min: 0, max: 23, singular: "hour" },
  dayOfMonth: {
    key: "dayOfMonth",
    label: "Day of month",
    min: 1,
    max: 31,
    singular: "day",
  },
  month: {
    key: "month",
    label: "Month",
    min: 1,
    max: 12,
    singular: "month",
    valueLabels: MONTH_LABELS,
  },
  dayOfWeek: {
    key: "dayOfWeek",
    label: "Day of week",
    min: 0,
    max: 6,
    singular: "weekday",
    valueLabels: WEEKDAY_LABELS,
  },
};

export function formatFieldValue(value: number, config: FieldConfig): string {
  return config.valueLabels?.[value] ?? String(value);
}

export function createDefaultFieldState(config: FieldConfig): FieldState {
  return {
    mode: "every",
    step: 1,
    rangeStart: config.min,
    rangeEnd: config.max,
    specific: [config.min],
  };
}

export function createDefaultCronState(): CronState {
  return FIELD_ORDER.reduce((state, key) => {
    state[key] = createDefaultFieldState(FIELD_CONFIGS[key]);
    return state;
  }, {} as CronState);
}
