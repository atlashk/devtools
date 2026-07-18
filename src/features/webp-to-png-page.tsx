"use client";

import ImageConvertPage from "@/features/shared/image-convert-page";

export default function WebpToPngPage() {
  return (
    <ImageConvertPage
      breadcrumb="WebP to PNG"
      description={
        <>
          Convert one or more <strong>.webp</strong> images to{" "}
          <strong>.png</strong>. PNG is a lossless format, so the output keeps
          the exact resolution and sharpness of the original image. Everything
          runs in your browser — files are never uploaded anywhere.
        </>
      }
      sourceExts={[".webp"]}
      sourceMimes={["image/webp"]}
      sourceLabel="WebP"
      targetExt=".png"
      targetMime="image/png"
      targetLabel="PNG"
    />
  );
}
