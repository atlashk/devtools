import type { Metadata } from "next";
import JwtPage from "@/features/cryptography/jwt-page";

export const metadata: Metadata = {
  title: "JWT Decoder",
  description: "Decode and inspect JSON Web Tokens.",
};

export default function Page() {
  return <JwtPage />;
}
