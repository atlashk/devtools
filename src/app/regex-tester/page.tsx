import type { Metadata } from "next";
import RegexTesterPage from "@/features/regex-tester-page";

export const metadata: Metadata = {
  title: "Regex Tester",
  description:
    "Test and debug regular expressions with live match highlighting, capture groups, and flags.",
};

export default function Page() {
  return <RegexTesterPage />;
}
