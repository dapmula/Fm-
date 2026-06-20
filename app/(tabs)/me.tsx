import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "@/store/session";
import { RadiusSlider } from "@/components/RadiusSlider";
import { BadgeRing } from "@/components/BadgeRing";
import { VerifiedCheck } from "@/components/VerifiedCheck";
import { craftLabel } from "@/domain/crafts";
import { formatCap } from "@/lib/format";
import { tierStyle } from "@/theme/tiers";

// Me / Settings: edit build, radius, subscription, payouts (Stripe),
// verification (spec §5).
export default function Me() {
  const me = useSession((s) => s.me);
  const radiusMi = useSession((s) => s.radiusMi);
  const setRadius = useSession((s) => s.setRadius);
  const setMe = useSession((s) => s.setMe);

  if (!me) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#0B0B0F", justifyContent: "center", padding: 20 }}>
        <Text style={{ color: "#8A8A99", textAlign: "center" }}>Not signed in.</Text>
      </SafeAreaView>
    );
  }

  const style = tierStyle(me.tierOverall);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0B0B0F" }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ alignItems: "center", marginBottom: 16 }}>
          <BadgeRing tier={me.tierOverall} fraction={me.tierOverall === "diamond" ? 1 : 0.15} size={104} icon="🏆" />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 }}>
            <Text style={{ color: "#F4F4F8", fontSize: 22, fontWeight: "800" }}>{me.displayName}</Text>
            {me.isVerified ? <VerifiedCheck size={16} /> : null}
          </View>
          <Text style={{ color: "#8A8A99" }}>@{me.handle} · {craftLabel(me.craft)}</Text>
          <Text style={{ color: style.metal, fontWeight: "700", marginTop: 4 }}>
            {style.label} · earns up to {formatCap(me.tierOverall)}
          </Text>
        </View>

        <Row label="View my FM card" onPress={() => router.push(`/profile/${me.id}`)} />
        <Row label="Edit build (craft · comps · badges)" onPress={() => router.push("/(onboarding)/craft")} />

        <Section title="Discovery radius">
          <RadiusSlider value={radiusMi} onChange={setRadius} />
        </Section>

        <Section title="Monetization">
          <Row label="FM+ subscription" sub="Boosts · promo · analytics · Go Live" onPress={() => {}} />
          <Row label="Get the Certified Check" sub="Paid verification" onPress={() => {}} />
          <Row label="Payouts (Stripe Express)" sub="Connect a bank to get paid" onPress={() => {}} />
        </Section>

        <Section title="Trust & Safety">
          <Row label="Blocked accounts" onPress={() => {}} />
          <Row label="Report a problem" onPress={() => {}} />
        </Section>

        <Pressable onPress={() => { setMe(null); router.replace("/(onboarding)/auth"); }} style={{ marginTop: 20 }}>
          <Text style={{ color: "#FF4D6D", textAlign: "center" }}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 22 }}>
      <Text style={{ color: "#8A8A99", fontWeight: "700", marginBottom: 8, textTransform: "uppercase", fontSize: 12 }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function Row({ label, sub, onPress }: { label: string; sub?: string; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: "#16161D",
        borderColor: "#2A2A36",
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
      }}
    >
      <Text style={{ color: "#F4F4F8", fontWeight: "600" }}>{label}</Text>
      {sub ? <Text style={{ color: "#8A8A99", fontSize: 12, marginTop: 2 }}>{sub}</Text> : null}
    </Pressable>
  );
}
