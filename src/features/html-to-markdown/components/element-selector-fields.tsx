"use client";

import { Checkbox } from "@/components/ui/shadcn/checkbox";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/shadcn/select";
import type { ElementSelectorType } from "../utils/extract-element";

interface ElementSelectorFieldsProps {
  id: string;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  type: ElementSelectorType;
  onTypeChange: (type: ElementSelectorType) => void;
  value: string;
  onValueChange: (value: string) => void;
}

export function ElementSelectorFields({
  id,
  enabled,
  onEnabledChange,
  type,
  onTypeChange,
  value,
  onValueChange,
}: ElementSelectorFieldsProps) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-gray-200 dark:border-gray-700 p-3">
      <div className="flex items-center gap-2">
        <Checkbox
          id={id}
          checked={enabled}
          onCheckedChange={(checked) => onEnabledChange(checked === true)}
        />
        <Label htmlFor={id} className="font-normal">
          Only extract a specific element (parent div)
        </Label>
      </div>
      {enabled && (
        <div className="flex gap-2">
          <Select
            value={type}
            onValueChange={(value) =>
              onTypeChange(value as ElementSelectorType)
            }
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="id">ID</SelectItem>
              <SelectItem value="class">Class</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder={
              type === "id"
                ? "e.g. main-content"
                : "e.g. article-body (space-separated classes match all)"
            }
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
