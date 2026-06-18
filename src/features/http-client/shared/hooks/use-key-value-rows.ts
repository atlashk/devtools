import { useEffect } from "react";
import { KeyValuePair } from "../types";

/**
 * Shared row-editing logic for the key/value editors.
 *
 * Keeps a trailing blank row available for input: a new empty row is appended
 * once the user starts filling the last one, and at least one row always remains.
 */
export function useKeyValueRows<T extends KeyValuePair>(
  items: T[],
  onChange: (items: T[]) => void,
  createEmpty: () => T
) {
  useEffect(() => {
    if (items.length === 0) onChange([createEmpty()]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, onChange]);

  const updateField = (id: string, field: keyof T, value: string) => {
    const target = items.find((item) => item.id === id);
    const isLastRow = items[items.length - 1]?.id === id;
    const wasEmpty = !!target && !target.key && !target.value;

    const updated = items.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );

    if (isLastRow && wasEmpty && value.trim() !== "") {
      onChange([...updated, createEmpty()]);
    } else {
      onChange(updated);
    }
  };

  const patchItem = (id: string, patch: Partial<T>) => {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const removeItem = (id: string) => {
    const filtered = items.filter((item) => item.id !== id);
    onChange(filtered.length === 0 ? [createEmpty()] : filtered);
  };

  return { updateField, patchItem, removeItem };
}
