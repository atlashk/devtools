import type { Metadata } from "next";
import GrpcClientPage from "@/features/http-client/grpc/grpc-client-page";

export const metadata: Metadata = {
  title: "gRPC Client",
  description: "Send and inspect gRPC requests.",
};

export default function Page() {
  return <GrpcClientPage />;
}
