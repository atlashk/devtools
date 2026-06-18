import type { Metadata } from "next";
import Base64Page from "@/features/base64/base64-page";

export const metadata: Metadata = {
  title: "Base64 Encode / Decode",
  description: "Encode and decode Base64 strings online.",
};

export default function Page() {
  return <Base64Page />;
}
