import type { Metadata } from "next";
import UrlEncoderPage from "@/features/url-encoder-page";

export const metadata: Metadata = {
  title: "URL Encode / Decode",
  description: "Encode and decode URL strings online.",
};

export default function Page() {
  return <UrlEncoderPage />;
}
