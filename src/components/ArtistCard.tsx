import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { router } from "expo-router";
import type { Profile } from "@/domain/types";
import { craftLabel } from "@/domain/crafts";
import { tierStyle } from "@/theme/tiers";
import { formatDistance } from "@/lib/format";
import { VerifiedCheck } from "./VerifiedCheck";

// Compact artist card for the Discover grid (spec §5).
export function ArtistCard({ profile }: { profile: Profile }) {
  const style = tierStyle(profile.tierOverall);
  return (
    <Pressable
      onPress={() => router.push(`/profile/${profile.id}`)}
      style={{
        width: "48%",
        backgroundColor: "#16161D",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#2A2A36",
        overflow: "hidden",
        marginBottom: 12,
      }}
    >
      <Image source={{ uri: profile.avatarUrl ?? undefined }} style={{ width: "100%", height: 130 }} />
      <View style={{ padding: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Text style={{ color: "#F4F4F8", fontWeight: "700" }} numberOfLines={1}>
            {profile.displayName}
          </Text>
          {profile.isVerified ? <VerifiedCheck size={12} /> : null}
        </View>
        <Text style={{ color: "#8A8A99", fontSize: 12 }}>{craftLabel(profile.craft)}</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
          <Text style={{ color: style.metal, fontWeight: "700", fontSize: 12 }}>{style.label}</Text>
          <Text style={{ color: "#8A8A99", fontSize: 12 }}>{formatDistance(profile.distanceMi)}</Text>
        </View>
      </View>
    </Pressable>
  );
}
