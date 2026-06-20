import React, { useState } from "react";
import { View, Text, TextInput, Pressable, FlatList } from "react-native";
import { router } from "expo-router";
import { Screen, H1 } from "@/components/ui";
import { useSession } from "@/store/session";
import { searchCities, type USCity } from "@/data/usCities";

// GPS-denied fallback: full US city/state picker (spec §4.2/§12).
export default function CityPicker() {
  const [q, setQ] = useState("");
  const patchDraft = useSession((s) => s.patchDraft);
  const results = searchCities(q);

  const pick = (c: USCity) => {
    patchDraft({ location: c.point, city: c.city, state: c.state });
    router.replace("/(onboarding)/profile");
  };

  return (
    <Screen>
      <H1>Where are you?</H1>
      <TextInput
        placeholder="Search city or state…"
        placeholderTextColor="#8A8A99"
        value={q}
        onChangeText={setQ}
        autoFocus
        style={{
          backgroundColor: "#1F1F29",
          color: "#F4F4F8",
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
          marginBottom: 12,
        }}
      />
      <FlatList
        data={results}
        keyExtractor={(c) => `${c.city}-${c.state}`}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => pick(item)}
            style={{ paddingVertical: 14, borderBottomColor: "#2A2A36", borderBottomWidth: 1 }}
          >
            <Text style={{ color: "#F4F4F8", fontSize: 16 }}>
              {item.city}, {item.state}
            </Text>
          </Pressable>
        )}
      />
    </Screen>
  );
}
