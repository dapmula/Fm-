import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { Screen, Button, H1, Sub } from "@/components/ui";
import { useSession } from "@/store/session";
import { CRAFTS } from "@/domain/crafts";

// Step 4 — 2K BUILD, pick your craft: category grid, each with its crest
// (spec §4.4).
export default function CraftStep() {
  const draft = useSession((s) => s.draft);
  const patchDraft = useSession((s) => s.patchDraft);

  return (
    <Screen>
      <View style={{ paddingTop: 20, flex: 1 }}>
        <H1>Pick your craft</H1>
        <Sub>This shapes your badges, your comps, and how you're discovered.</Sub>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
            {CRAFTS.map((c) => {
              const active = draft.craft === c.craft;
              return (
                <Pressable
                  key={c.craft}
                  onPress={() => patchDraft({ craft: c.craft, badgeSlugs: [], compArtist: null })}
                  style={{
                    width: "48%",
                    backgroundColor: active ? "#2A2350" : "#16161D",
                    borderColor: active ? "#7C5CFF" : "#2A2A36",
                    borderWidth: 1,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 12,
                  }}
                >
                  <Text style={{ fontSize: 30 }}>{c.crestIcon}</Text>
                  <Text style={{ color: "#F4F4F8", fontWeight: "700", marginTop: 8 }}>{c.label}</Text>
                  {c.crestReady ? (
                    <Text style={{ color: "#8FE3FF", fontSize: 11, marginTop: 2 }}>crest ready</Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
          <View style={{ height: 90 }} />
        </ScrollView>

        <View style={{ position: "absolute", left: 20, right: 20, bottom: 16 }}>
          <Button
            label="Next: who do you compare to?"
            onPress={() => router.push("/(onboarding)/comp")}
            disabled={!draft.craft}
          />
        </View>
      </View>
    </Screen>
  );
}
