import type { Metadata } from "next";
import GraphqlClientPage from "@/features/http-client/graphql/graphql-client-page";

export const metadata: Metadata = {
  title: "GraphQL Client",
  description: "Send and inspect GraphQL requests.",
};

export default function Page() {
  return <GraphqlClientPage />;
}
