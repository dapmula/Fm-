import React from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { Screen, Button, H1, Sub } from "@/components/ui";
import { useSession } from "@/store/session";
import { getFounder } from "@/data/repo";

// Step 1 — Auth (FB-style): one clean screen, email / Apple / Google. A hidden
// admin login drops straight to the seeded @Mulamaxs account (spec §4.1/§16).
export default function Auth() {
  const enterAdminPreview = useSession((s) => s.enterAdminPreview);

  const continueOnboarding = () => router.push("/(onboarding)/location");

  const adminPreview = () => {
    enterAdminPreview(getFounder());
    router.replace("/(tabs)");
  };

  return (
    <Screen style={{ justifyContent: "center" }}>
      <Text style={{ fontSize: 48, marginBottom: 8 }}>🏆</Text>
      <H1>Feature Me</H1>
      <Sub>Where every artist gets discovered, ranked, and booked.</Sub>

      <View style={{ gap: 12 }}>
        <Button label="Continue with Email" onPress={continueOnboarding} />
        <Button label="Continue with Apple" variant="ghost" onPress={continueOnboarding} />
        <Button label="Continue with Google" variant="ghost" onPress={continueOnboarding} />
      </View>

      {/* Hidden admin preview — long-press the footer (spec §4.1). */}
      <Pressable onLongPress={adminPreview} delayLongPress={600} style={{ marginTop: 28 }}>
        <Text style={{ color: "#8A8A99", fontSize: 12, textAlign: "center" }}>
          By continuing you agree to the Terms & Privacy Policy.
        </Text>
      </Pressable>
    </Screen>
  );
}
