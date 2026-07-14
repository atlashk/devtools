import type { Metadata } from "next";
import BcryptPage from "@/features/cryptography/bcrypt-page";

export const metadata: Metadata = {
  title: "Bcrypt Hash / Compare",
  description: "Hash strings with Bcrypt and verify matches online.",
};

export default function Page() {
  return <BcryptPage />;
}
