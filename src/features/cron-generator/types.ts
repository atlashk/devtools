export type FieldMode = "every" | "step" | "range" | "specific";

export type FieldState = {
  mode: FieldMode;
  step: number;
  rangeStart: number;
  rangeEnd: number;
  specific: number[];
};

export type CronFieldKey =
  | "minute"
  | "hour"
  | "dayOfMonth"
  | "month"
  | "dayOfWeek";

export type CronState = Record<CronFieldKey, FieldState>;
