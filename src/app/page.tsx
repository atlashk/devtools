import type { Metadata } from "next";
import HomePage from "@/features/home-page";

export const metadata: Metadata = {
  title: { absolute: "DevTools" },
<<<<<<< HEAD
  description: "A collection of handy, client-side DevTools.",
=======
  description: "A collection of handy, client-side developer tools.",
>>>>>>> 7cfe43d (update home title)
};

export default function Page() {
  return <HomePage />;
}
