import type { Metadata } from "next";
import WebpToPngPage from "@/features/webp-to-png/webp-to-png-page";

export const metadata: Metadata = {
  title: "WebP to PNG Converter",
  description:
    "Convert one or many WebP images to PNG in your browser, preserving the original resolution and sharpness (lossless).",
};

export default function Page() {
  return <WebpToPngPage />;
}
