import React from "react";
import { View, Text, Image, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { fetchProfile, fetchUserBadges } from "@/data/repo";
import { SEED_POSTS } from "@/data/mock";
import { BadgeRing } from "@/components/BadgeRing";
import { VerifiedCheck } from "@/components/VerifiedCheck";
import { Button } from "@/components/ui";
import { craftLabel, CRAFT_BY_KEY } from "@/domain/crafts";
import { computeProgress, remainingToNext } from "@/domain/badgeEngine";
import { tierStyle } from "@/theme/tiers";
import { formatCap } from "@/lib/format";
import { useSession } from "@/store/session";

// Profile / FM Card (spec §5): crest + tier, "Compares to ___", craft tags,
// badge collection with glowing animated rings, work grid, Follow + DM, and
// Book a Feature (price capped by tier).
export default function ProfileCard() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const me = useSession((s) => s.me);
  const isMe = me?.id === id;

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", id],
    queryFn: () => fetchProfile(id!),
  });
  const { data: badges } = useQuery({
    queryKey: ["badges", id],
    queryFn: () => fetchUserBadges(id!),
  });

  if (isLoading || !profile) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0B0B0F", justifyContent: "center" }}>
        <ActivityIndicator color="#7C5CFF" />
      </View>
    );
  }

  const style = tierStyle(profile.tierOverall);
  const crest = CRAFT_BY_KEY[profile.craft]?.crestIcon ?? "🏆";
  const posts = SEED_POSTS.filter((p) => p.userId === profile.id);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#0B0B0F" }} contentContainerStyle={{ padding: 16 }}>
      <View style={{ alignItems: "center" }}>
        <BadgeRing
          tier={profile.tierOverall}
          fraction={profile.tierOverall === "diamond" ? 1 : 0.35}
          size={120}
          icon={crest}
        />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12 }}>
          <Text style={{ color: "#F4F4F8", fontSize: 24, fontWeight: "800" }}>{profile.displayName}</Text>
          {profile.isVerified ? <VerifiedCheck size={18} /> : null}
        </View>
        <Text style={{ color: "#8A8A99" }}>@{profile.handle}</Text>
        <Text style={{ color: style.metal, fontWeight: "700", marginTop: 4 }}>
          {style.label} {craftLabel(profile.craft)} · earns up to {formatCap(profile.tierOverall)}
        </Text>
        {profile.compArtist ? (
          <Text style={{ color: "#C9C9D4", marginTop: 4 }}>Compares to {profile.compArtist}</Text>
        ) : null}
        {profile.bio ? (
          <Text style={{ color: "#EDEDF2", textAlign: "center", marginTop: 10 }}>{profile.bio}</Text>
        ) : null}
        <Text style={{ color: "#8A8A99", marginTop: 4 }}>
          📍 {[profile.city, profile.state].filter(Boolean).join(", ")}
        </Text>
      </View>

      {/* Actions */}
      {!isMe ? (
        <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
          <View style={{ flex: 1 }}>
            <Button label="Follow" onPress={() => {}} />
          </View>
          <View style={{ flex: 1 }}>
            <Button label="DM" variant="ghost" onPress={() => {}} />
          </View>
        </View>
      ) : (
        <View style={{ marginTop: 18 }}>
          <Button label="Climb from Bronze →" variant="ghost" onPress={() => {}} />
        </View>
      )}
      {!isMe ? (
        <View style={{ marginTop: 10 }}>
          <Button label={`Book a Feature · up to ${formatCap(profile.tierOverall)}`} onPress={() => router.push(`/book/${profile.id}`)} />
        </View>
      ) : null}

      {/* Badge collection */}
      <Text style={{ color: "#F4F4F8", fontWeight: "800", fontSize: 18, marginTop: 26, marginBottom: 12 }}>
        Badges
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
        {(badges ?? []).map((b) => {
          const progress = computeProgress(b.lovePoints, b.verifiedBookings);
          const rem = remainingToNext(b.lovePoints, b.verifiedBookings);
          return (
            <View key={b.slug} style={{ width: "31%", alignItems: "center", marginBottom: 18 }}>
              <BadgeRing tier={b.tier} fraction={progress.fraction} size={78} icon="🏅" label={b.name} />
              <Text style={{ color: "#F4F4F8", fontSize: 12, fontWeight: "600", marginTop: 6, textAlign: "center" }}>
                {b.name}
              </Text>
              <Text style={{ color: tierStyle(b.tier).metal, fontSize: 11 }}>{tierStyle(b.tier).label}</Text>
              {progress.blockedOnProof ? (
                <Text style={{ color: "#FFC83D", fontSize: 10, textAlign: "center" }}>needs paid proof</Text>
              ) : rem ? (
                <Text style={{ color: "#5A5A66", fontSize: 10 }}>
                  {rem.loveLeft > 0 ? `${rem.loveLeft} love` : ""}
                </Text>
              ) : null}
            </View>
          );
        })}
      </View>

      {/* Work grid */}
      <Text style={{ color: "#F4F4F8", fontWeight: "800", fontSize: 18, marginTop: 8, marginBottom: 12 }}>
        Work
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        {posts.map((p) => (
          <Image
            key={p.id}
            source={{ uri: p.imageUrl }}
            style={{ width: "32%", aspectRatio: 0.8, borderRadius: 10 }}
          />
        ))}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
