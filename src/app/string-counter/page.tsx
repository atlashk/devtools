import type { Metadata } from "next";
import StringCounterPage from "@/features/string-counter/string-counter-page";

export const metadata: Metadata = {
  title: "String Counter",
  description: "Count characters, words, lines and bytes in your text.",
};

export default function Page() {
  return <StringCounterPage />;
}
