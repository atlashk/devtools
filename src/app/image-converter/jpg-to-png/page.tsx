import type { Metadata } from "next";
import JpgToPngPage from "@/features/image-converter/jpg-to-png-page";

export const metadata: Metadata = {
  title: "JPG to PNG Converter",
  description:
    "Convert one or many JPG images to PNG in your browser, preserving the original resolution and sharpness (lossless).",
};

export default function Page() {
  return <JpgToPngPage />;
}
