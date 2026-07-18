import type { CronState, FieldState } from "../types";
import { FIELD_CONFIGS, formatFieldValue, type FieldConfig } from "./field-config";

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function pluralize(count: number, word: string): string {
  return count === 1 ? word : `${word}s`;
}

function formatList(values: number[], config: FieldConfig): string {
  const labels = [...new Set(values)]
    .sort((a, b) => a - b)
    .map((v) => formatFieldValue(v, config));

  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]}`;
}

function describeMinuteHour(minute: FieldState, hour: FieldState): string {
  const minuteIsSingle = minute.mode === "specific" && minute.specific.length === 1;
  const hourIsSingle = hour.mode === "specific" && hour.specific.length === 1;

  if (minuteIsSingle && hourIsSingle) {
    return `at ${pad(hour.specific[0])}:${pad(minute.specific[0])}`;
  }

  if (minute.mode === "every" && hour.mode === "every") {
    return "every minute";
  }

  const minutePhrase = describeMinutePart(minute);
  const hourPhrase = describeHourPart(hour);

  if (!minutePhrase && !hourPhrase) return "every minute";
  if (minutePhrase && !hourPhrase) return `${minutePhrase}, every hour`;
  if (!minutePhrase && hourPhrase) return `every minute, ${hourPhrase}`;
  return `${minutePhrase}, ${hourPhrase}`;
}

function describeMinutePart(minute: FieldState): string {
  const config = FIELD_CONFIGS.minute;
  switch (minute.mode) {
    case "every":
      return "";
    case "step":
      return `every ${minute.step} ${pluralize(minute.step, "minute")}`;
    case "range":
      return `every minute from ${minute.rangeStart} through ${minute.rangeEnd}`;
    case "specific":
      return `at minute ${formatList(minute.specific, config)}`;
  }
}

function describeHourPart(hour: FieldState): string {
  switch (hour.mode) {
    case "every":
      return "";
    case "step":
      return `every ${hour.step} ${pluralize(hour.step, "hour")}`;
    case "range":
      return `every hour from ${hour.rangeStart} through ${hour.rangeEnd}`;
    case "specific":
      return `past hour ${formatList(hour.specific, FIELD_CONFIGS.hour)}`;
  }
}

function describeDayOfMonth(state: FieldState): string {
  switch (state.mode) {
    case "every":
      return "";
    case "step":
      return `every ${state.step} ${pluralize(state.step, "day")} of the month`;
    case "range":
      return `on every day of the month from ${state.rangeStart} through ${state.rangeEnd}`;
    case "specific":
      return `on day ${formatList(state.specific, FIELD_CONFIGS.dayOfMonth)} of the month`;
  }
}

function describeMonth(state: FieldState): string {
  const config = FIELD_CONFIGS.month;
  switch (state.mode) {
    case "every":
      return "";
    case "step":
      return `every ${state.step} ${pluralize(state.step, "month")}`;
    case "range":
      return `from ${formatFieldValue(state.rangeStart, config)} through ${formatFieldValue(state.rangeEnd, config)}`;
    case "specific":
      return `in ${formatList(state.specific, config)}`;
  }
}

function describeDayOfWeek(state: FieldState): string {
  const config = FIELD_CONFIGS.dayOfWeek;
  switch (state.mode) {
    case "every":
      return "";
    case "step":
      return `every ${state.step} ${pluralize(state.step, "day")} of the week`;
    case "range":
      return `from ${formatFieldValue(state.rangeStart, config)} through ${formatFieldValue(state.rangeEnd, config)}`;
    case "specific":
      return `on ${formatList(state.specific, config)}`;
  }
}

export function describeCron(state: CronState): string {
  const parts = [
    describeMinuteHour(state.minute, state.hour),
    describeDayOfMonth(state.dayOfMonth),
    describeMonth(state.month),
    describeDayOfWeek(state.dayOfWeek),
  ].filter(Boolean);

  let sentence = parts.join(", ");
  sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";

  const isRestricted =
    state.dayOfMonth.mode !== "every" && state.dayOfWeek.mode !== "every";
  if (isRestricted) {
    sentence +=
      " Runs when either the day-of-month or the day-of-week condition matches.";
  }

  return sentence;
}
