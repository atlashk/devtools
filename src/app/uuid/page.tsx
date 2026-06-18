import type { Metadata } from "next";
import UuidPage from "@/features/uuid/uuid-page";

export const metadata: Metadata = {
  title: "UUID Generator",
  description: "Generate random UUIDs.",
};

export default function Page() {
  return <UuidPage />;
}
