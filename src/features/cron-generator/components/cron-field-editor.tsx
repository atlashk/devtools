"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/shadcn/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/shadcn/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/shadcn/toggle-group";
import { formatFieldValue, type FieldConfig } from "../utils/field-config";
import type { FieldMode, FieldState } from "../types";

const MODE_OPTIONS: { value: FieldMode; label: string }[] = [
  { value: "every", label: "Every" },
  { value: "step", label: "Every N" },
  { value: "range", label: "Range" },
  { value: "specific", label: "Specific" },
];

type CronFieldEditorProps = {
  config: FieldConfig;
  state: FieldState;
  onChange: (state: FieldState) => void;
};

function NumberField({
  min,
  max,
  value,
  className,
  onCommit,
}: {
  min: number;
  max: number;
  value: number;
  className?: string;
  onCommit: (value: number) => void;
}) {
  const [text, setText] = useState(String(value));
  const isFocused = useRef(false);

  useEffect(() => {
    if (!isFocused.current) setText(String(value));
  }, [value]);

  return (
    <Input
      type="number"
      min={min}
      max={max}
      value={text}
      className={className}
      onFocus={() => {
        isFocused.current = true;
      }}
      onChange={(e) => {
        const raw = e.target.value;
        setText(raw);
        if (raw === "") return;
        const n = Number(raw);
        if (Number.isNaN(n)) return;
        onCommit(Math.min(Math.max(min, n), max));
      }}
      onBlur={() => {
        isFocused.current = false;
        const n = Number(text);
        if (text === "" || Number.isNaN(n)) {
          setText(String(value));
          return;
        }
        const clamped = Math.min(Math.max(min, n), max);
        setText(String(clamped));
        onCommit(clamped);
      }}
    />
  );
}

function ValuePicker({
  config,
  value,
  onChange,
}: {
  config: FieldConfig;
  value: number;
  onChange: (value: number) => void;
}) {
  if (config.valueLabels) {
    return (
      <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
        <SelectTrigger size="sm" className="w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: config.max - config.min + 1 }, (_, i) => config.min + i).map(
            (v) => (
              <SelectItem key={v} value={String(v)}>
                {formatFieldValue(v, config)}
              </SelectItem>
            )
          )}
        </SelectContent>
      </Select>
    );
  }

  return (
    <NumberField
      min={config.min}
      max={config.max}
      value={value}
      className="w-20"
      onCommit={onChange}
    />
  );
}

export function CronFieldEditor({ config, state, onChange }: CronFieldEditorProps) {
  const values = Array.from(
    { length: config.max - config.min + 1 },
    (_, i) => config.min + i
  );

  return (
    <div className="flex flex-col gap-3">
      <Label className="text-sm font-medium">{config.label}</Label>

      <RadioGroup
        value={state.mode}
        onValueChange={(mode) => onChange({ ...state, mode: mode as FieldMode })}
        className="flex flex-wrap gap-4"
      >
        {MODE_OPTIONS.map((option) => (
          <div key={option.value} className="flex items-center gap-2">
            <RadioGroupItem
              value={option.value}
              id={`${config.key}-${option.value}`}
            />
            <Label
              htmlFor={`${config.key}-${option.value}`}
              className="font-normal cursor-pointer"
            >
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>

      {state.mode === "step" && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Every</span>
          <NumberField
            min={1}
            max={config.max - config.min + 1}
            value={state.step}
            className="w-20"
            onCommit={(step) => onChange({ ...state, step })}
          />
          <span className="text-muted-foreground">{config.singular}(s)</span>
        </div>
      )}

      {state.mode === "range" && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">From</span>
          <ValuePicker
            config={config}
            value={state.rangeStart}
            onChange={(v) => onChange({ ...state, rangeStart: v })}
          />
          <span className="text-muted-foreground">to</span>
          <ValuePicker
            config={config}
            value={state.rangeEnd}
            onChange={(v) => onChange({ ...state, rangeEnd: v })}
          />
        </div>
      )}

      {state.mode === "specific" && (
        <ToggleGroup
          type="multiple"
          variant="outline"
          size="sm"
          spacing={1}
          value={state.specific.map(String)}
          onValueChange={(vals) => onChange({ ...state, specific: vals.map(Number) })}
          className="flex flex-wrap gap-1"
        >
          {values.map((v) => (
            <ToggleGroupItem
              key={v}
              value={String(v)}
              className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary/90"
            >
              {formatFieldValue(v, config)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      )}
    </div>
  );
}
