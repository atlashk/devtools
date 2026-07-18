import type { CronState, FieldState } from "../types";
import { FIELD_CONFIGS, FIELD_ORDER, type FieldConfig } from "./field-config";

function clampStep(step: number, config: FieldConfig): number {
  const max = config.max - config.min + 1;
  return Math.min(Math.max(1, Math.floor(step) || 1), max);
}

export function buildFieldExpression(
  state: FieldState,
  config: FieldConfig
): string {
  switch (state.mode) {
    case "every":
      return "*";
    case "step":
      return `*/${clampStep(state.step, config)}`;
    case "range":
      return `${state.rangeStart}-${state.rangeEnd}`;
    case "specific": {
      const values = [...new Set(state.specific)].sort((a, b) => a - b);
      return values.length > 0 ? values.join(",") : "*";
    }
  }
}

export function buildCronExpression(state: CronState): string {
  return FIELD_ORDER.map((key) =>
    buildFieldExpression(state[key], FIELD_CONFIGS[key])
  ).join(" ");
}
