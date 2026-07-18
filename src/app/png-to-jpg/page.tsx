import type { Metadata } from "next";
import PngToJpgPage from "@/features/png-to-jpg-page";

export const metadata: Metadata = {
  title: "PNG to JPG Converter",
  description:
    "Convert one or many PNG images to JPG in your browser, flattening transparency onto a white background.",
};

export default function Page() {
  return <PngToJpgPage />;
}
