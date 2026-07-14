import type { Metadata } from "next";
import DiffCheckerPage from "@/features/string/diff-checker-page";

export const metadata: Metadata = {
  title: "Diff Checker",
  description: "Compare two texts and highlight the differences.",
};

export default function Page() {
  return <DiffCheckerPage />;
}
