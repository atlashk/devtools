import type { Metadata } from "next";
import HomePage from "@/features/home-page";

export const metadata: Metadata = {
  title: "Home",
  description: "A collection of handy, client-side developer tools.",
};

export default function Page() {
  return <HomePage />;
}
