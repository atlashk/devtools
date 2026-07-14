"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/shadcn/breadcrumb";
import { Button } from "@/components/ui/shadcn/button";
import { Separator } from "@/components/ui/shadcn/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/shadcn/sidebar";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { Download, Eraser, ImageIcon, Loader2, Upload, X } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type ConvertStatus = "pending" | "converting" | "done" | "error";

type ConvertItem = {
  id: string;
  file: File;
  status: ConvertStatus;
  width?: number;
  height?: number;
  outputBlob?: Blob;
  outputUrl?: string;
  outputSize?: number;
  error?: string;
};

export type ImageConvertPageProps = {
  breadcrumb: string;
  description: React.ReactNode;
  /** Lowercase file extensions accepted as source, including the dot, e.g. [".jpg", ".jpeg"]. */
  sourceExts: string[];
  /** MIME types accepted as source, e.g. ["image/jpeg"]. */
  sourceMimes: string[];
  /** Human label used in messages, e.g. "JPG". */
  sourceLabel: string;
  /** Target file extension including the dot, e.g. ".png". */
  targetExt: string;
  /** Target MIME type used for encoding, e.g. "image/png". */
  targetMime: string;
  /** Human label used in messages, e.g. "PNG". */
  targetLabel: string;
  /** Encoding quality passed to canvas.toBlob (0-1). Ignored by lossless formats like PNG. */
  quality?: number;
  /**
   * The target format has no alpha channel (e.g. JPG), so transparent
   * pixels must be flattened onto a white background before encoding.
   */
  fillWhiteBackground?: boolean;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function convertImage(
  file: File,
  targetMime: string,
  quality: number | undefined,
  fillWhiteBackground: boolean | undefined
): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context is not available");

    if (fillWhiteBackground) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw at 1:1 pixel scale to preserve the original resolution exactly.
    ctx.drawImage(bitmap, 0, 0);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), targetMime, quality)
    );
    if (!blob) throw new Error("Failed to encode image");

    return { blob, width: bitmap.width, height: bitmap.height };
  } finally {
    bitmap.close();
  }
}

export default function ImageConvertPage({
  breadcrumb,
  description,
  sourceExts,
  sourceMimes,
  sourceLabel,
  targetExt,
  targetMime,
  targetLabel,
  quality,
  fillWhiteBackground,
}: ImageConvertPageProps) {
  const [items, setItems] = useState<ConvertItem[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { handleError } = useErrorHandler();

  const sourceExtPattern = useMemo(
    () =>
      new RegExp(
        `(${sourceExts.map((ext) => ext.replace(".", "\\.")).join("|")})$`,
        "i"
      ),
    [sourceExts]
  );

  const outputNameFor = useCallback(
    (fileName: string) => fileName.replace(sourceExtPattern, "") + targetExt,
    [sourceExtPattern, targetExt]
  );

  const isAccepted = useCallback(
    (file: File) =>
      sourceMimes.includes(file.type) || sourceExtPattern.test(file.name),
    [sourceMimes, sourceExtPattern]
  );

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      const all = Array.from(fileList);
      const incoming = all.filter(isAccepted);
      const rejected = all.length - incoming.length;
      if (rejected > 0) {
        toast.warning(
          `${rejected} file(s) skipped (only ${sourceLabel} images are accepted)`
        );
      }
      if (incoming.length === 0) return;

      setItems((prev) => [
        ...prev,
        ...incoming.map((file) => ({
          id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
          file,
          status: "pending" as ConvertStatus,
        })),
      ]);
    },
    [isAccepted, sourceLabel]
  );

  const handleConvert = useCallback(async () => {
    const pending = items.filter(
      (it) => it.status === "pending" || it.status === "error"
    );
    if (pending.length === 0) return;

    setIsConverting(true);
    for (const item of pending) {
      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id
            ? { ...it, status: "converting", error: undefined }
            : it
        )
      );
      try {
        const { blob, width, height } = await convertImage(
          item.file,
          targetMime,
          quality,
          fillWhiteBackground
        );
        const url = URL.createObjectURL(blob);
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? {
                  ...it,
                  status: "done",
                  outputBlob: blob,
                  outputUrl: url,
                  outputSize: blob.size,
                  width,
                  height,
                }
              : it
          )
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Conversion failed";
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id ? { ...it, status: "error", error: message } : it
          )
        );
        handleError(err, `Convert ${item.file.name}`);
      }
    }
    setIsConverting(false);
  }, [items, handleError, targetMime, quality, fillWhiteBackground]);

  const handleDownload = useCallback(
    (item: ConvertItem) => {
      if (!item.outputUrl) return;
      const a = document.createElement("a");
      a.href = item.outputUrl;
      a.download = outputNameFor(item.file.name);
      document.body.appendChild(a);
      a.click();
      a.remove();
    },
    [outputNameFor]
  );

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

  const handleClear = useCallback(() => {
    setItems((prev) => {
      prev.forEach((it) => it.outputUrl && URL.revokeObjectURL(it.outputUrl));
      return [];
    });
  }, []);

  const doneCount = items.filter((it) => it.status === "done").length;
  const canConvert = items.some(
    (it) => it.status === "pending" || it.status === "error"
  );

  const acceptAttr = [...sourceMimes, ...sourceExts].join(",");

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
                  <BreadcrumbPage>{breadcrumb}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-3xl mx-auto flex flex-col gap-6">
            <p className="text-sm text-muted-foreground">{description}</p>

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
              <p className="font-medium">
                Drag & drop {sourceLabel} images here
              </p>
              <p className="text-sm text-muted-foreground">
                or click to select files (multiple allowed)
              </p>
              <input
                ref={inputRef}
                type="file"
                accept={acceptAttr}
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>

            {/* Actions */}
            {items.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleConvert} disabled={!canConvert || isConverting}>
                  {isConverting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ImageIcon className="size-4" />
                  )}
                  {isConverting ? "Converting..." : `Convert to ${targetLabel}`}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadAll}
                  disabled={doneCount === 0}
                >
                  <Download className="size-4" />
                  Download all ({doneCount})
                </Button>
                <Button variant="outline" onClick={handleClear} disabled={isConverting}>
                  <Eraser className="size-4" />
                  Clear all
                </Button>
              </div>
            )}

            {/* File list */}
            {items.length > 0 && (
              <div className="flex flex-col gap-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-md border border-gray-200 dark:border-gray-700 p-3"
                  >
                    <ImageIcon className="size-5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(item.file.size)}
                        {item.status === "done" && item.width && (
                          <>
                            {" · "}
                            {item.width}×{item.height}px{` · ${targetLabel} `}
                            {formatBytes(item.outputSize ?? 0)}
                          </>
                        )}
                        {item.status === "error" && (
                          <span className="text-red-500"> · {item.error}</span>
                        )}
                      </p>
                    </div>

                    {item.status === "converting" && (
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    )}
                    {item.status === "done" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(item)}
                      >
                        <Download className="size-4" />
                        {targetLabel}
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8 shrink-0"
                      onClick={() => handleRemove(item.id)}
                      disabled={isConverting && item.status === "converting"}
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
