"use client";

import ImageConvertPage from "@/features/shared/image-convert-page";

export default function JpgToPngPage() {
  return (
    <ImageConvertPage
      breadcrumb="JPG to PNG"
      description={
        <>
          Convert one or more <strong>.jpg</strong> / <strong>.jpeg</strong>{" "}
          images to <strong>.png</strong>. PNG is a lossless format, so the
          output keeps the exact resolution and sharpness of the decoded
          image. Everything runs in your browser — files are never uploaded
          anywhere.
        </>
      }
      sourceExts={[".jpg", ".jpeg"]}
      sourceMimes={["image/jpeg"]}
      sourceLabel="JPG"
      targetExt=".png"
      targetMime="image/png"
      targetLabel="PNG"
    />
  );
}
