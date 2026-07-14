"use client";

import ImageConvertPage from "@/features/image-converter/image-convert-page";

export default function PngToJpgPage() {
  return (
    <ImageConvertPage
      breadcrumb="PNG to JPG"
      description={
        <>
          Convert one or more <strong>.png</strong> images to{" "}
          <strong>.jpg</strong>. JPG does not support transparency, so any
          transparent areas are flattened onto a white background. Everything
          runs in your browser — files are never uploaded anywhere.
        </>
      }
      sourceExts={[".png"]}
      sourceMimes={["image/png"]}
      sourceLabel="PNG"
      targetExt=".jpg"
      targetMime="image/jpeg"
      targetLabel="JPG"
      quality={0.92}
      fillWhiteBackground
    />
  );
}
