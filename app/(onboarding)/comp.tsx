import React, { useState } from "react";
import { View, Text, TextInput } from "react-native";
import { router } from "expo-router";
import { Screen, Button, Chip, H1, Sub } from "@/components/ui";
import { useSession } from "@/store/session";
import { CRAFT_BY_KEY } from "@/domain/crafts";

// Step 5 — 2K BUILD, who do you compare to? Player-comparison step. Suggests
// comps by craft + free text. Becomes "Compares to ___" on the profile
// (spec §4.5).
export default function CompStep() {
  const draft = useSession((s) => s.draft);
  const patchDraft = useSession((s) => s.patchDraft);
  const meta = draft.craft ? CRAFT_BY_KEY[draft.craft] : null;
  const [free, setFree] = useState("");

  const chosen = draft.compArtist;

  const next = () => {
    const value = free.trim() || chosen;
    patchDraft({ compArtist: value ?? null });
    router.push("/(onboarding)/badges");
  };

  return (
    <Screen>
      <View style={{ paddingTop: 20, flex: 1 }}>
        <H1>Who do you compare to?</H1>
        <Sub>Pick a name that captures your style. This shows as "Compares to ___".</Sub>

        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {meta?.comps.map((name) => (
            <Chip
              key={name}
              label={name}
              active={chosen === name && !free}
              onPress={() => {
                setFree("");
                patchDraft({ compArtist: name });
              }}
            />
          ))}
        </View>

        <Text style={{ color: "#8A8A99", marginTop: 16, marginBottom: 6 }}>Or type your own</Text>
        <TextInput
          value={free}
          onChangeText={setFree}
          placeholder="Anyone you want"
          placeholderTextColor="#5A5A66"
          style={{
            backgroundColor: "#1F1F29",
            color: "#F4F4F8",
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 12,
          }}
        />

        <View style={{ position: "absolute", left: 20, right: 20, bottom: 16 }}>
          <Button label="Next: pick your badges" onPress={next} disabled={!chosen && !free.trim()} />
        </View>
      </View>
    </Screen>
  );
}
