import type { Metadata } from "next";
import BcryptPage from "@/features/bcrypt-page";

export const metadata: Metadata = {
  title: "Bcrypt Hash / Compare",
  description: "Hash strings with Bcrypt and verify matches online.",
};

export default function Page() {
  return <BcryptPage />;
}
