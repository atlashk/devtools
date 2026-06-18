import type { Metadata } from "next";
import RestClientPage from "@/features/http-client/rest/rest-client-page";

export const metadata: Metadata = {
  title: "REST Client",
  description: "Send and inspect HTTP requests.",
};

export default function Page() {
  return <RestClientPage />;
}
