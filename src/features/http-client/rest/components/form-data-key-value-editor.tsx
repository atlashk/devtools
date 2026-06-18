"use client";

import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/shadcn/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/shadcn/table";
import { FormDataItem } from "@/features/http-client/rest/types/rest.types";
import { Trash2 } from "lucide-react";
import { useKeyValueRows } from "@/features/http-client/shared/hooks/use-key-value-rows";
import { emptyFormDataItem } from "../utils/utils";

interface FormDataKeyValueEditorProps {
  items: FormDataItem[];
  onChange: (items: FormDataItem[]) => void;
  placeholder?: { key: string; value: string; description: string };
}

export function FormDataKeyValueEditor({
  items,
  onChange,
  placeholder = { key: "Key", value: "Value", description: "Description" },
}: FormDataKeyValueEditorProps) {
  const { updateField, patchItem, removeItem } = useKeyValueRows(
    items,
    onChange,
    emptyFormDataItem
  );

  const updateType = (id: string, type: "text" | "file") =>
    patchItem(id, { type, value: "", fileName: undefined });

  const updateFile = (id: string, file: File | null) =>
    patchItem(id, { value: file?.name ?? "", fileName: file?.name });

  const pickFile = (id: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = (e) =>
      updateFile(id, (e.target as HTMLInputElement).files?.[0] ?? null);
    input.click();
  };

  return (
    <div className="border rounded-lg">
      <Table className="table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/4">{placeholder.key}</TableHead>
            <TableHead className="w-[10%]">Type</TableHead>
            <TableHead className="w-[35%]">{placeholder.value}</TableHead>
            <TableHead className="w-1/4">{placeholder.description}</TableHead>
            <TableHead className="w-[5%]"></TableHead>
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
                <Select
                  value={item.type}
                  onValueChange={(value: "text" | "file") =>
                    updateType(item.id, value)
                  }
                >
                  <SelectTrigger className="w-20 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="file">File</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Input
                    value={item.value}
                    onChange={
                      item.type === "text"
                        ? (e) => updateField(item.id, "value", e.target.value)
                        : undefined
                    }
                    placeholder={
                      item.type === "text" ? placeholder.value : "No file chosen"
                    }
                    className="h-8 flex-1"
                    readOnly={item.type === "file"}
                  />
                  {item.type === "file" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => pickFile(item.id)}
                      className="h-8 px-2 flex-shrink-0"
                    >
                      Select
                    </Button>
                  )}
                </div>
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
