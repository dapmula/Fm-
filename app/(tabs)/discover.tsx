import React, { useState } from "react";
import { View, Text, ScrollView, FlatList } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Chip } from "@/components/ui";
import { RadiusSlider } from "@/components/RadiusSlider";
import { ArtistCard } from "@/components/ArtistCard";
import { useSession } from "@/store/session";
import { fetchNearby } from "@/data/repo";
import { FOUNDER_HOME } from "@/data/mock";
import { CRAFTS } from "@/domain/crafts";
import type { Craft } from "@/domain/types";
import { SafeAreaView } from "react-native-safe-area-context";

// Discover: radius slider (defaults to set radius) + craft filter chips + grid
// of nearby artists via PostGIS (spec §5). Radius changeable any time.
export default function Discover() {
  const radiusMi = useSession((s) => s.radiusMi);
  const setRadius = useSession((s) => s.setRadius);
  const me = useSession((s) => s.me);
  const [craft, setCraft] = useState<Craft | null>(null);

  // Center on the user's real location; fall back to the seed cluster center.
  const center = me?.location ?? FOUNDER_HOME;

  const { data } = useQuery({
    queryKey: ["nearby", center, radiusMi, craft],
    queryFn: () => fetchNearby(center, radiusMi, craft),
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0B0B0F" }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <Text style={{ color: "#F4F4F8", fontSize: 26, fontWeight: "800", marginBottom: 12 }}>
          Discover
        </Text>
        <RadiusSlider value={radiusMi} onChange={setRadius} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14 }}>
          <Chip label="All" active={craft === null} onPress={() => setCraft(null)} />
          {CRAFTS.map((c) => (
            <Chip
              key={c.craft}
              label={c.label}
              active={craft === c.craft}
              onPress={() => setCraft(c.craft)}
            />
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={data ?? []}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => <ArtistCard profile={item} />}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingTop: 14 }}
        ListEmptyComponent={
          <Text style={{ color: "#8A8A99", textAlign: "center", marginTop: 40 }}>
            No artists in range — widen your radius.
          </Text>
        }
      />
    </SafeAreaView>
  );
}
