import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { Screen, Button, H1, Sub } from "@/components/ui";
import { useSession } from "@/store/session";
import { badgesForCraft } from "@/domain/badgeCatalog";
import type { Profile } from "@/domain/types";

// Step 6 — 2K BUILD, pick your badges: choose badges in your craft, everyone
// starts Bronze. These also become a discovery filter (spec §4.6). Then drop
// into the feed.
export default function BadgesStep() {
  const draft = useSession((s) => s.draft);
  const patchDraft = useSession((s) => s.patchDraft);
  const setMe = useSession((s) => s.setMe);
  const badges = draft.craft ? badgesForCraft(draft.craft) : [];

  const toggle = (slug: string) => {
    const has = draft.badgeSlugs.includes(slug);
    patchDraft({
      badgeSlugs: has
        ? draft.badgeSlugs.filter((s) => s !== slug)
        : [...draft.badgeSlugs, slug],
    });
  };

  const finish = () => {
    if (!draft.craft) return;
    const me: Profile = {
      id: "me-local",
      handle: draft.handle || "you",
      displayName: draft.displayName || "You",
      bio: draft.bio || null,
      avatarUrl: draft.avatarUrl,
      craft: draft.craft,
      compArtist: draft.compArtist,
      city: draft.city,
      state: draft.state,
      location: draft.location,
      radiusMi: draft.radiusMi,
      tierOverall: "bronze", // everyone starts Bronze (spec §6)
      isVerified: false,
      isAdmin: false,
      createdAt: new Date().toISOString(),
    };
    setMe(me);
    router.replace("/(tabs)");
  };

  return (
    <Screen>
      <View style={{ paddingTop: 20, flex: 1 }}>
        <H1>Claim your badges</H1>
        <Sub>Everyone starts Bronze. Climb to Diamond with Love + verified bookings.</Sub>

        <ScrollView showsVerticalScrollIndicator={false}>
          {badges.map((b) => {
            const active = draft.badgeSlugs.includes(b.slug);
            return (
              <Pressable
                key={b.slug}
                onPress={() => toggle(b.slug)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: active ? "#2A2350" : "#16161D",
                  borderColor: active ? "#7C5CFF" : "#2A2A36",
                  borderWidth: 1,
                  borderRadius: 14,
                  padding: 14,
                  marginBottom: 10,
                }}
              >
                <Text style={{ fontSize: 22, marginRight: 12 }}>🏅</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#F4F4F8", fontWeight: "700" }}>{b.name}</Text>
                  <Text style={{ color: "#CD7F32", fontSize: 12 }}>Bronze · climb from here</Text>
                </View>
                <Text style={{ color: active ? "#7C5CFF" : "#5A5A66", fontSize: 20 }}>
                  {active ? "✓" : "+"}
                </Text>
              </Pressable>
            );
          })}
          <View style={{ height: 90 }} />
        </ScrollView>

        <View style={{ position: "absolute", left: 20, right: 20, bottom: 16 }}>
          <Button
            label="Drop into the feed"
            onPress={finish}
            disabled={draft.badgeSlugs.length === 0}
          />
        </View>
      </View>
    </Screen>
  );
}
