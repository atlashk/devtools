"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/shadcn/breadcrumb";
import { Button } from "@/components/ui/shadcn/button";
import { Checkbox } from "@/components/ui/shadcn/checkbox";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import { Separator } from "@/components/ui/shadcn/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/shadcn/sidebar";
import { Spinner } from "@/components/ui/shadcn/spinner";
import { useErrorHandler } from "@/hooks/use-error-handler";
import {
  Download,
  Eraser,
  ImageIcon,
  Maximize2,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

type ResizeStatus = "pending" | "resizing" | "done" | "error";

type ResizeItem = {
  id: string;
  file: File;
  status: ResizeStatus;
  originalWidth?: number;
  originalHeight?: number;
  outputBlob?: Blob;
  outputUrl?: string;
  outputWidth?: number;
  outputHeight?: number;
  outputSize?: number;
  error?: string;
};

const ACCEPTED_MIMES = ["image/jpeg", "image/png", "image/webp"];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  try {
    return { width: bitmap.width, height: bitmap.height };
  } finally {
    bitmap.close();
  }
}

async function resizeImage(
  file: File,
  targetWidth: number,
  targetHeight: number
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context is not available");

    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

    const mime = file.type || "image/png";
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), mime, 0.92)
    );
    if (!blob) throw new Error("Failed to encode image");

    return blob;
  } finally {
    bitmap.close();
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function outputNameFor(fileName: string, width: number, height: number) {
  const dotIndex = fileName.lastIndexOf(".");
  const base = dotIndex === -1 ? fileName : fileName.slice(0, dotIndex);
  const ext = dotIndex === -1 ? "" : fileName.slice(dotIndex);
  return `${base}-${width}x${height}${ext}`;
}

export default function ImageResizerPage() {
  const [items, setItems] = useState<ResizeItem[]>([]);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [keepAspect, setKeepAspect] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { handleError } = useErrorHandler();

  const isAccepted = useCallback(
    (file: File) =>
      ACCEPTED_MIMES.includes(file.type) || /\.(jpe?g|png|webp)$/i.test(file.name),
    []
  );

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      const all = Array.from(fileList);
      const incoming = all.filter(isAccepted);
      const rejected = all.length - incoming.length;
      if (rejected > 0) {
        toast.warning(
          `${rejected} file(s) skipped (only JPG, PNG and WebP images are accepted)`
        );
      }
      if (incoming.length === 0) return;

      const newItems: ResizeItem[] = incoming.map((file) => ({
        id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
        file,
        status: "pending",
      }));
      setItems((prev) => [...prev, ...newItems]);

      newItems.forEach((item) => {
        getImageDimensions(item.file)
          .then(({ width: w, height: h }) => {
            setItems((prev) =>
              prev.map((it) =>
                it.id === item.id
                  ? { ...it, originalWidth: w, originalHeight: h }
                  : it
              )
            );
          })
          .catch(() => {
            // Dimensions are informational only; resizing still works without them.
          });
      });
    },
    [isAccepted]
  );

  const targetWidth = Number(width);
  const targetHeight = Number(height);
  const hasValidWidth = width !== "" && targetWidth > 0;
  const hasValidHeight = height !== "" && targetHeight > 0;
  const canResizeSettings = keepAspect
    ? hasValidWidth
    : hasValidWidth && hasValidHeight;

  const handleResize = useCallback(async () => {
    const targets = items.filter((it) => it.status !== "resizing");
    if (targets.length === 0 || !canResizeSettings) return;

    setIsResizing(true);
    for (const item of targets) {
      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id
            ? { ...it, status: "resizing", error: undefined }
            : it
        )
      );
      try {
        const { width: originalWidth, height: originalHeight } =
          item.originalWidth && item.originalHeight
            ? { width: item.originalWidth, height: item.originalHeight }
            : await getImageDimensions(item.file);

        const outW = Math.max(1, Math.round(targetWidth));
        const outH = keepAspect
          ? Math.max(1, Math.round((outW * originalHeight) / originalWidth))
          : Math.max(1, Math.round(targetHeight));

        const MIN_VISIBLE_DELAY_MS = 400;
        const [blob] = await Promise.all([
          resizeImage(item.file, outW, outH),
          delay(MIN_VISIBLE_DELAY_MS),
        ]);
        const url = URL.createObjectURL(blob);
        setItems((prev) =>
          prev.map((it) => {
            if (it.id !== item.id) return it;
            if (it.outputUrl) URL.revokeObjectURL(it.outputUrl);
            return {
              ...it,
              status: "done",
              outputBlob: blob,
              outputUrl: url,
              outputSize: blob.size,
              outputWidth: outW,
              outputHeight: outH,
              originalWidth,
              originalHeight,
            };
          })
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Resize failed";
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id ? { ...it, status: "error", error: message } : it
          )
        );
        handleError(err, `Resize ${item.file.name}`);
      }
    }
    setIsResizing(false);
  }, [items, canResizeSettings, keepAspect, targetWidth, targetHeight, handleError]);

  const handleDownload = useCallback((item: ResizeItem) => {
    if (!item.outputUrl || !item.outputWidth || !item.outputHeight) return;
    const a = document.createElement("a");
    a.href = item.outputUrl;
    a.download = outputNameFor(item.file.name, item.outputWidth, item.outputHeight);
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, []);

  const handleDownloadAll = useCallback(() => {
    items.filter((it) => it.status === "done").forEach((it) => handleDownload(it));
  }, [items, handleDownload]);

  const handleRemove = useCallback((id: string) => {
    setItems((prev) => {
      const target = prev.find((it) => it.id === id);
      if (target?.outputUrl) URL.revokeObjectURL(target.outputUrl);
      return prev.filter((it) => it.id !== id);
    });
  }, []);

  // Clears just the resize output for an item, keeping the source file in the
  // selected list so it can be resized again.
  const handleClearResult = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        if (it.outputUrl) URL.revokeObjectURL(it.outputUrl);
        return {
          ...it,
          status: "pending",
          outputBlob: undefined,
          outputUrl: undefined,
          outputWidth: undefined,
          outputHeight: undefined,
          outputSize: undefined,
          error: undefined,
        };
      })
    );
  }, []);

  const handleClear = useCallback(() => {
    setItems((prev) => {
      prev.forEach((it) => it.outputUrl && URL.revokeObjectURL(it.outputUrl));
      return [];
    });
  }, []);

  // Every selected file stays listed regardless of status, so the source list
  // does not vanish after a resize.
  const selectedItems = items;
  const resultItems = items.filter((it) => it.status !== "pending");
  const doneCount = items.filter((it) => it.status === "done").length;
  const canResize =
    canResizeSettings && items.some((it) => it.status !== "resizing");

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Image Resizer</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-3xl mx-auto flex flex-col gap-6">
            <p className="text-sm text-muted-foreground">
              Resize one or more <strong>JPG</strong>, <strong>PNG</strong> or{" "}
              <strong>WebP</strong> images to a new width and height. Everything
              runs in your browser — files are never uploaded anywhere.
            </p>

            {/* Drop zone */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                addFiles(e.dataTransfer.files);
              }}
              className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-10 text-center transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-gray-300 dark:border-gray-700 hover:border-primary/60"
              }`}
            >
              <Upload className="size-8 text-muted-foreground" />
              <p className="font-medium">Drag & drop images here</p>
              <p className="text-sm text-muted-foreground">
                or click to select files (multiple allowed)
              </p>
              <input
                ref={inputRef}
                type="file"
                accept={[...ACCEPTED_MIMES, ".jpg", ".jpeg", ".png", ".webp"].join(
                  ","
                )}
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>

            {/* Selected source files (persist across resizes) */}
            {selectedItems.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">
                  Selected files ({selectedItems.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedItems.map((item) => (
                    <span
                      key={item.id}
                      className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs"
                    >
                      <ImageIcon className="size-3.5 text-muted-foreground" />
                      <span className="max-w-48 truncate">{item.file.name}</span>
                      <span className="text-muted-foreground">
                        {formatBytes(item.file.size)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        className="ml-0.5 rounded-full hover:bg-background"
                        aria-label={`Remove ${item.file.name}`}
                      >
                        <X className="size-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Resize settings */}
            <div className="flex flex-col gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="resize-width">Width (px)</Label>
                  <Input
                    id="resize-width"
                    type="number"
                    min={1}
                    inputMode="numeric"
                    placeholder="e.g. 1920"
                    value={width}
                    onChange={(e) => {
                      setWidth(e.target.value);
                      setHeight(e.target.value);
                    }}
                    className="w-32"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="resize-height">Height (px)</Label>
                  <Input
                    id="resize-height"
                    type="number"
                    min={1}
                    inputMode="numeric"
                    placeholder="e.g. 1080"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    disabled={keepAspect}
                    className="w-32"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={keepAspect}
                  onCheckedChange={(checked) => setKeepAspect(checked === true)}
                />
                Maintain aspect ratio (height is computed per image from width)
              </label>
            </div>

            {/* Actions */}
            {items.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleResize} disabled={!canResize || isResizing}>
                  {isResizing ? (
                    <Spinner className="size-4" />
                  ) : (
                    <Maximize2 className="size-4" />
                  )}
                  {isResizing ? "Resizing..." : "Resize"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadAll}
                  disabled={doneCount === 0}
                >
                  <Download className="size-4" />
                  Download all ({doneCount})
                </Button>
                <Button variant="outline" onClick={handleClear} disabled={isResizing}>
                  <Eraser className="size-4" />
                  Clear all
                </Button>
              </div>
            )}

            {/* Results */}
            {resultItems.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">Results</p>
                {resultItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-md border border-gray-200 dark:border-gray-700 p-3"
                  >
                    <ImageIcon className="size-5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(item.file.size)}
                        {item.originalWidth && item.originalHeight && (
                          <>
                            {" · "}
                            {item.originalWidth}×{item.originalHeight}px
                          </>
                        )}
                        {item.status === "done" &&
                          item.outputWidth &&
                          item.outputHeight && (
                            <>
                              {" → "}
                              {item.outputWidth}×{item.outputHeight}px
                              {" · "}
                              {formatBytes(item.outputSize ?? 0)}
                            </>
                          )}
                        {item.status === "error" && (
                          <span className="text-red-500"> · {item.error}</span>
                        )}
                      </p>
                    </div>

                    {item.status === "resizing" && (
                      <Spinner className="size-4 text-muted-foreground" />
                    )}
                    {item.status === "done" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(item)}
                      >
                        <Download className="size-4" />
                        Download
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8 shrink-0"
                      onClick={() => handleClearResult(item.id)}
                      disabled={isResizing && item.status === "resizing"}
                      aria-label={`Clear result for ${item.file.name}`}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
