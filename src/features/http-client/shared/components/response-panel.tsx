"use client";

import { Badge } from "@/components/ui/shadcn/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/shadcn/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/shadcn/tabs";

import { MonacoEditor } from "@/components/ui/monaco-editor/monaco-editor";
import {
  formatJson,
  getHttpStatusColor,
  getHttpStatusName,
} from "@/utils/utils";
import { ProtocolResponse } from "../types";

interface ResponsePanelProps {
  response: ProtocolResponse | null;
  /** Message shown before a request has been sent. */
  emptyMessage?: string;
}

/**
 * Read-only response viewer for request/response protocols: status/time/size
 * summary plus Body (Monaco, JSON) and Headers tabs.
 */
export function ResponsePanel({
  response,
  emptyMessage = "Send a request to see the response",
}: ResponsePanelProps) {
  if (!response) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  const responseHeaders = response.headers || {};
  const responseBody = formatJson(response.body);

  return (
    <div className="flex flex-col h-full space-y-1">
      {/* Response Status */}
      <div className="flex items-center gap-4 p-2 bg-muted/50 rounded-lg flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">Status:</span>
          <Badge variant="outline" className={getHttpStatusColor(response.status)}>
            {response.status}{" "}
            {getHttpStatusName(response.status, response.statusText)}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">Time:</span>
          <span className="text-xs">{response.time || 0}ms</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">Size:</span>
          <span className="text-xs">{response.size || 0} KB</span>
        </div>
      </div>

      {/* Response Content Tabs */}
      <Tabs
        defaultValue="body"
        className="w-full flex flex-col flex-grow min-h-0 h-[calc(100%-35px)]"
      >
        <TabsList className="grid w-full grid-cols-2 flex-shrink-0 h-8">
          <TabsTrigger value="body">Body</TabsTrigger>
          <TabsTrigger value="headers">Headers</TabsTrigger>
        </TabsList>

        {/* Body Tab */}
        <TabsContent
          value="body"
          className="flex-grow flex flex-col overflow-hidden h-[calc(100%-35px)]"
        >
          <div className="border rounded-lg overflow-hidden h-full">
            <MonacoEditor
              value={responseBody}
              onChange={() => {}}
              readOnly={true}
              className="border-0 rounded-none h-full"
              lang="json"
              showClearButton={false}
              showFormatButton={false}
            />
          </div>
        </TabsContent>

        {/* Headers Tab */}
        <TabsContent
          value="headers"
          className="flex-grow flex flex-col overflow-hidden h-[calc(100%-35px)]"
        >
          <div className="border rounded-lg h-full overflow-y-auto overflow-x-hidden">
            {Object.entries(responseHeaders).length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">Header Name</TableHead>
                    <TableHead className="w-2/3">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(responseHeaders).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell className="font-medium break-words">
                        {key}
                      </TableCell>
                      <TableCell className="break-words whitespace-pre-wrap">
                        {value}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-4">
                <p className="text-muted-foreground text-sm">No headers</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
