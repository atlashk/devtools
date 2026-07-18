import type { Metadata } from "next";
import JsonFormatterPage from "@/features/json-formatter-page";

export const metadata: Metadata = {
  title: "JSON Formatter",
  description: "Format, validate and beautify JSON.",
};

export default function Page() {
  return <JsonFormatterPage />;
}
