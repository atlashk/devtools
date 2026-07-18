import type { Metadata } from "next";
import ImageResizerPage from "@/features/image-resizer-page";

export const metadata: Metadata = {
  title: "Image Resizer",
  description:
    "Resize JPG, PNG and WebP images to a new width and height in your browser, with optional aspect ratio locking.",
};

export default function Page() {
  return <ImageResizerPage />;
}
