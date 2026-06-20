import React from "react";
import { Redirect } from "expo-router";
import { useSession } from "@/store/session";

// Entry point — drop into the feed once you have a profile, otherwise start
// onboarding at the auth screen (spec §4).
export default function Index() {
  const me = useSession((s) => s.me);
  return <Redirect href={me ? "/(tabs)" : "/(onboarding)/auth"} />;
}
