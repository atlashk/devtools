"use client";

import { MonacoEditor } from "@/components/ui/monaco-editor/monaco-editor";
import { Label } from "@/components/ui/shadcn/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/shadcn/radio-group";
import {
  FormDataItem,
  KeyValuePair,
  RequestBody,
  RequestBodyType,
} from "@/features/http-client/rest/types/rest.types";
import { useEffect, useState } from "react";
import { FormDataKeyValueEditor } from "./form-data-key-value-editor";
import { KeyValueEditor } from "@/features/http-client/shared/components/key-value-editor";

interface RequestBodyViewerProps {
  requestBody?: RequestBody;
  onChange: (requestBody: RequestBody) => void;
}

export function RequestBodyViewer({
  requestBody = { type: "none" },
  onChange,
}: RequestBodyViewerProps) {
  const [selectedType, setSelectedType] = useState<RequestBodyType>(
    requestBody.type || "none"
  );
  const [rawContent, setRawContent] = useState(requestBody.rawContent || "");
  const [formData, setFormData] = useState<FormDataItem[]>(
    requestBody.formData || []
  );
  const [urlEncoded, setUrlEncoded] = useState<KeyValuePair[]>(
    requestBody.urlEncoded || []
  );

  // Sync with external changes
  useEffect(() => {
    setSelectedType(requestBody.type || "none");
    setRawContent(requestBody.rawContent || "");
    setFormData(requestBody.formData || []);
    setUrlEncoded(requestBody.urlEncoded || []);
  }, [requestBody]);

  // Update parent when any change occurs
  const updateParent = (newRequestBody: RequestBody) => {
    onChange(newRequestBody);
  };

  const createUpdatedRequestBody = (
    updates: Partial<RequestBody>
  ): RequestBody => {
    const newRawContent =
      updates.rawContent !== undefined ? updates.rawContent : rawContent;

    return {
      type: updates.type || selectedType,
      formData:
        updates.type === "form-data" || selectedType === "form-data"
          ? updates.formData || formData
          : undefined,
      urlEncoded:
        updates.type === "x-www-form-urlencoded" ||
        selectedType === "x-www-form-urlencoded"
          ? updates.urlEncoded || urlEncoded
          : undefined,
      rawContent:
        updates.type === "raw" || selectedType === "raw"
          ? newRawContent
          : undefined,
    };
  };

  const handleTypeChange = (newType: RequestBodyType) => {
    setSelectedType(newType);
    updateParent(createUpdatedRequestBody({ type: newType }));
  };

  const handleFormDataChange = (newFormData: FormDataItem[]) => {
    setFormData(newFormData);
    updateParent(createUpdatedRequestBody({ formData: newFormData }));
  };

  const handleUrlEncodedChange = (newUrlEncoded: KeyValuePair[]) => {
    setUrlEncoded(newUrlEncoded);
    updateParent(createUpdatedRequestBody({ urlEncoded: newUrlEncoded }));
  };

  const handleRawContentChange = (newContent: string) => {
    setRawContent(newContent);
    updateParent(createUpdatedRequestBody({ rawContent: newContent }));
  };

  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="shrink-0">
        <RadioGroup value={selectedType} onValueChange={handleTypeChange}>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="none" id="none" />
              <Label htmlFor="none">None</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="form-data" id="form-data" />
              <Label htmlFor="form-data">form-data</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="x-www-form-urlencoded"
                id="x-www-form-urlencoded"
              />
              <Label htmlFor="x-www-form-urlencoded">
                x-www-form-urlencoded
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="raw" id="raw" />
              <Label htmlFor="raw">Raw</Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      {selectedType === "none" && (
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          This request does not have a body
        </div>
      )}

      {selectedType === "form-data" && (
        <FormDataKeyValueEditor
          items={formData}
          onChange={handleFormDataChange}
          placeholder={{
            key: "Key",
            value: "Value",
            description: "Description",
          }}
        />
      )}

      {selectedType === "x-www-form-urlencoded" && (
        <KeyValueEditor
          items={urlEncoded}
          onChange={handleUrlEncodedChange}
          placeholder={{
            key: "Key",
            value: "Value",
            description: "Description",
          }}
        />
      )}

      {selectedType === "raw" && (
        <div className="mt-4 min-h-[8rem] flex-1 overflow-hidden rounded-lg border">
          <MonacoEditor
            value={rawContent}
            onChange={handleRawContentChange}
            height="100%"
            lang="json"
          />
        </div>
      )}
    </div>
  );
}
