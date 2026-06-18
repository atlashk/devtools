"use client";

import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/shadcn/table";
import { Trash2 } from "lucide-react";
import { KeyValuePair } from "../types";
import { emptyKeyValue } from "../utils";
import { useKeyValueRows } from "../hooks/use-key-value-rows";

interface KeyValueEditorProps {
  items: KeyValuePair[];
  onChange: (items: KeyValuePair[]) => void;
  placeholder?: { key: string; value: string; description: string };
}

/** Editable key/value table with an always-present trailing blank row. */
export function KeyValueEditor({
  items,
  onChange,
  placeholder = { key: "Key", value: "Value", description: "Description" },
}: KeyValueEditorProps) {
  const { updateField, removeItem } = useKeyValueRows(
    items,
    onChange,
    () => emptyKeyValue()
  );

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{placeholder.key}</TableHead>
            <TableHead>{placeholder.value}</TableHead>
            <TableHead>{placeholder.description}</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="hover:bg-transparent">
              <TableCell>
                <Input
                  value={item.key}
                  onChange={(e) => updateField(item.id, "key", e.target.value)}
                  placeholder={placeholder.key}
                  className="h-8"
                />
              </TableCell>
              <TableCell>
                <Input
                  value={item.value}
                  onChange={(e) => updateField(item.id, "value", e.target.value)}
                  placeholder={placeholder.value}
                  className="h-8"
                />
              </TableCell>
              <TableCell>
                <Input
                  value={item.description}
                  onChange={(e) =>
                    updateField(item.id, "description", e.target.value)
                  }
                  placeholder={placeholder.description}
                  className="h-8"
                />
              </TableCell>
              <TableCell>
                {items.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
