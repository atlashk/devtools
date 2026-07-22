import type { Metadata } from "next";
import StorageConverterPage from "@/features/storage-converter-page";

export const metadata: Metadata = {
  title: "Storage Converter",
  description:
    "Convert between storage units: bytes, KB, MB, GB, and binary units like KiB, MiB, GiB.",
};

export default function Page() {
  return <StorageConverterPage />;
}
