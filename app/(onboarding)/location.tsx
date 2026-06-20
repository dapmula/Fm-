import React, { useState } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { Screen, Button, H1, Sub } from "@/components/ui";
import { useSession } from "@/store/session";
import { getCurrentLocation, DEFAULT_RADIUS_MI } from "@/lib/location";
import { RadiusSlider } from "@/components/RadiusSlider";

// Step 2 — Location (Tinder-style): request GPS, reverse-geocode to city/state,
// drop a default 25mi radius they can move now and any time later. We default
// to the user's REAL location and never hard-code a city (spec §4.2/§12/§17).
export default function LocationStep() {
  const patchDraft = useSession((s) => s.patchDraft);
  const setRadius = useSession((s) => s.setRadius);
  const draft = useSession((s) => s.draft);
  const [radius, setLocalRadius] = useState(DEFAULT_RADIUS_MI);
  const [status, setStatus] = useState<"idle" | "asking" | "ok" | "denied">("idle");
  const [place, setPlace] = useState<string | null>(null);

  const requestGps = async () => {
    setStatus("asking");
    const resolved = await getCurrentLocation();
    if (!resolved) {
      setStatus("denied");
      return;
    }
    patchDraft({
      location: resolved.point,
      city: resolved.city,
      state: resolved.state,
      radiusMi: radius,
    });
    setPlace([resolved.city, resolved.state].filter(Boolean).join(", ") || "your area");
    setStatus("ok");
  };

  const next = () => {
    setRadius(radius);
    patchDraft({ radiusMi: radius });
    router.push("/(onboarding)/profile");
  };

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text style={{ fontSize: 44, marginBottom: 8 }}>📍</Text>
        <H1>See talent near you</H1>
        <Sub>Feature Me is location-first. Turn on location to discover artists around you.</Sub>

        {status !== "ok" ? (
          <View style={{ gap: 12 }}>
            <Button
              label={status === "asking" ? "Locating…" : "Use my location"}
              onPress={requestGps}
              disabled={status === "asking"}
            />
            <Button
              label="Pick my city instead"
              variant="ghost"
              onPress={() => router.push("/(onboarding)/city-picker")}
            />
            {status === "denied" ? (
              <Text style={{ color: "#FF4D6D", fontSize: 13 }}>
                Location was denied — pick your city to continue.
              </Text>
            ) : null}
          </View>
        ) : (
          <View style={{ gap: 18 }}>
            <Text style={{ color: "#F4F4F8", fontSize: 16 }}>📌 {place}</Text>
            <RadiusSlider value={radius} onChange={setLocalRadius} />
            <Button label="Next" onPress={next} />
          </View>
        )}
      </View>
    </Screen>
  );
}
