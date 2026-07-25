import type { Metadata } from "next";
import CaseConverterPage from "@/features/string/case-converter-page";

export const metadata: Metadata = {
  title: "Case Converter",
  description:
    "Convert text between lowercase, UPPERCASE, camelCase, Capitalize Case and snake_case.",
};

export default function Page() {
  return <CaseConverterPage />;
}
