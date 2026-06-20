import React from "react";
import { View, Text, Image, Pressable, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import type { Post } from "@/domain/types";
import { craftLabel } from "@/domain/crafts";
import { useLove } from "@/store/love";
import { priceCapCents } from "@/domain/badgeEngine";
import { formatPrice, formatDistance, compactCount } from "@/lib/format";
import { BadgeRing } from "./BadgeRing";
import { VerifiedCheck } from "./VerifiedCheck";
import { computeProgress } from "@/domain/badgeEngine";

const { height } = Dimensions.get("window");

// One full-screen feed post (TikTok/IG vertical scroll, spec §5). Right rail =
// Like / Comment / Share; bottom overlay = creator + craft + distance, caption,
// and two inline buttons: `Book Now · $price` and a big Like. Liking ticks the
// creator's badge ring up (Love engine, spec §6).
export function FeedCard({ post, tabBarHeight = 80 }: { post: Post; tabBarHeight?: number }) {
  const author = post.author;
  const liked = useLove((s) => s.liked[post.id] ?? false);
  const toggle = useLove((s) => s.toggle);
  const bump = useLove((s) => (author ? s.authorLoveBump[author.id] ?? 0 : 0));

  const tier = author?.tierOverall ?? "bronze";
  // Live ring fill reflects session Love bumps so a like visibly ticks it up.
  const progress = computeProgress(bump, 0);

  const price = author ? priceCapCents(tier) : 0;

  const openProfile = () => author && router.push(`/profile/${author.id}`);
  const book = () => author && router.push(`/book/${author.id}`);

  return (
    <View style={{ height: height, width: "100%" }}>
      <Image source={{ uri: post.imageUrl }} style={{ flex: 1 }} resizeMode="cover" />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.85)"]}
        style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "55%" }}
      />

      {/* Right rail */}
      <View
        style={{
          position: "absolute",
          right: 12,
          bottom: tabBarHeight + 150,
          alignItems: "center",
          gap: 22,
        }}
      >
        <Pressable onPress={openProfile} style={{ alignItems: "center" }}>
          <BadgeRing tier={tier} fraction={progress.fraction} size={56} icon="🏆" />
        </Pressable>
        <Rail
          icon={liked ? "❤️" : "🤍"}
          label={compactCount(post.likeCount + (liked ? 1 : 0))}
          onPress={() => author && toggle(post.id, author.id, "like")}
        />
        <Rail icon="💬" label="Comment" />
        <Rail
          icon="↗️"
          label={compactCount(post.shareCount)}
          onPress={() => author && toggle(post.id, author.id, "share")}
        />
        <Rail
          icon="🔖"
          label="Save"
          onPress={() => author && toggle(post.id, author.id, "save")}
        />
      </View>

      {/* Bottom overlay */}
      <View style={{ position: "absolute", left: 16, right: 80, bottom: tabBarHeight + 16 }}>
        <Pressable onPress={openProfile} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={{ color: "white", fontWeight: "800", fontSize: 17 }}>
            {author?.displayName}
          </Text>
          {author?.isVerified ? <VerifiedCheck /> : null}
          <Text style={{ color: "#C9C9D4", fontSize: 13 }}>
            · {author ? craftLabel(author.craft) : ""} · {formatDistance(author?.distanceMi)}
          </Text>
        </Pressable>

        {post.caption ? (
          <Text style={{ color: "#EDEDF2", marginTop: 6, marginBottom: 12 }}>{post.caption}</Text>
        ) : (
          <View style={{ height: 12 }} />
        )}

        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable
            onPress={book}
            style={{
              backgroundColor: "#7C5CFF",
              paddingVertical: 12,
              paddingHorizontal: 18,
              borderRadius: 14,
              flex: 1,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "800" }}>
              Book Now · {formatPrice(price)}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => author && toggle(post.id, author.id, "like")}
            style={{
              backgroundColor: liked ? "#FF4D6D" : "rgba(255,255,255,0.14)",
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 14,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "800" }}>{liked ? "❤️" : "Like"}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function Rail({ icon, label, onPress }: { icon: string; label: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ alignItems: "center" }}>
      <Text style={{ fontSize: 30 }}>{icon}</Text>
      <Text style={{ color: "white", fontSize: 11, marginTop: 2 }}>{label}</Text>
    </Pressable>
  );
}
