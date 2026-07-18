import type { Metadata } from "next";
import CronGeneratorPage from "@/features/cron-generator/cron-generator-page";

export const metadata: Metadata = {
  title: "Cron Generator",
  description: "Build and preview crontab-style cron expressions.",
};

export default function Page() {
  return <CronGeneratorPage />;
}
