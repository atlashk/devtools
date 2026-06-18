import type { Metadata } from "next";
import WebSocketClientPage from "@/features/http-client/websocket/websocket-client-page";

export const metadata: Metadata = {
  title: "WebSocket Client",
  description: "Connect and exchange WebSocket messages.",
};

export default function Page() {
  return <WebSocketClientPage />;
}
