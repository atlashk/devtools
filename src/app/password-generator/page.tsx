import type { Metadata } from "next";
import PasswordGeneratorPage from "@/features/password-generator-page";

export const metadata: Metadata = {
  title: "Password Generator",
  description: "Generate strong, random passwords with custom character rules.",
};

export default function Page() {
  return <PasswordGeneratorPage />;
}
