import { TeamMembers } from "@/components/team-members";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Members | Travelese",
};

export default async function Members() {
  return <TeamMembers />;
}
