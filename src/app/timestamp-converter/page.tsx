import type { Metadata } from "next";
import TimestampPage from "@/features/timestamp-converter-page";

export const metadata: Metadata = {
  title: "Timestamp Converter",
  description: "Convert between Unix timestamps and human-readable dates.",
};

export default function Page() {
  return <TimestampPage />;
}
