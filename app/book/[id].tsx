import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { fetchProfile } from "@/data/repo";
import { Button, Chip } from "@/components/ui";
import { useSession } from "@/store/session";
import { priceCapCents, feeCents } from "@/domain/badgeEngine";
import { validateBooking, minRevisionsFor, STATUS_COPY, ESCROW_HELD_STATES } from "@/domain/booking";
import type { BookingStatus } from "@/domain/types";
import { formatPrice } from "@/lib/format";
import { tierStyle } from "@/theme/tiers";

// Book a Feature (spec §8): real-world service → Stripe Connect + Apple/Google
// Pay (NEVER IAP, spec §10). Shows visible escrow, the 15% FM fee, and the
// revision bylaws. The money moves live in Edge Functions; this screen drives
// the request and renders the escrow state both parties see.
export default function BookFlow() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const me = useSession((s) => s.me);
  const { data: artist, isLoading } = useQuery({
    queryKey: ["profile", id],
    queryFn: () => fetchProfile(id!),
  });

  const [amount, setAmount] = useState(0);
  const [revisions, setRevisions] = useState(1);
  const [status, setStatus] = useState<BookingStatus | null>(null);

  if (isLoading || !artist) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0B0B0F", justifyContent: "center" }}>
        <ActivityIndicator color="#7C5CFF" />
      </View>
    );
  }

  const cap = priceCapCents(artist.tierOverall);
  const minRev = minRevisionsFor(artist.tierOverall);
  const presets = pricePresets(cap);
  const amt = amount || presets[0];

  const validation = validateBooking({
    clientId: me?.id ?? "client",
    artistId: artist.id,
    artistTier: artist.tierOverall,
    amountCents: amt,
    revisionsAllowed: revisions,
  });

  const request = () => setStatus("funded"); // demo: assume accept + fund

  if (status) {
    return <EscrowView status={status} amountCents={amt} onAdvance={setStatus} />;
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#0B0B0F" }} contentContainerStyle={{ padding: 18 }}>
      <Text style={{ color: "#F4F4F8", fontSize: 22, fontWeight: "800" }}>
        Book {artist.displayName}
      </Text>
      <Text style={{ color: tierStyle(artist.tierOverall).metal, marginTop: 2 }}>
        {tierStyle(artist.tierOverall).label} tier · cap {formatPrice(cap)}
      </Text>

      <Text style={{ color: "#8A8A99", marginTop: 22, marginBottom: 8 }}>Amount</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {presets.map((p) => (
          <Chip key={p} label={formatPrice(p)} active={amt === p} onPress={() => setAmount(p)} />
        ))}
      </View>

      <Text style={{ color: "#8A8A99", marginTop: 14, marginBottom: 8 }}>
        Revisions included {minRev > 0 ? `(min ${minRev})` : "(this tier can set 0)"}
      </Text>
      <View style={{ flexDirection: "row" }}>
        {[0, 1, 2, 3].filter((n) => n >= minRev).map((n) => (
          <Chip key={n} label={`${n}`} active={revisions === n} onPress={() => setRevisions(n)} />
        ))}
      </View>

      {/* Visible fee + escrow breakdown (spec §8) */}
      <View
        style={{
          marginTop: 22,
          backgroundColor: "#16161D",
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "#2A2A36",
          padding: 16,
        }}
      >
        <Line label="Feature price" value={formatPrice(amt)} />
        <Line label="FM fee (15%)" value={`– ${formatPrice(feeCents(amt))}`} muted />
        <View style={{ height: 1, backgroundColor: "#2A2A36", marginVertical: 8 }} />
        <Line label="Artist receives" value={formatPrice(amt - feeCents(amt))} bold />
        <Text style={{ color: "#8FE3FF", fontSize: 12, marginTop: 10 }}>
          🔒 Funds are held in escrow and only released when you approve the delivery.
        </Text>
      </View>

      {!validation.ok ? (
        <Text style={{ color: "#FF4D6D", marginTop: 12 }}>{validation.error}</Text>
      ) : null}

      <View style={{ marginTop: 18 }}>
        <Button
          label={`Fund booking · ${formatPrice(amt)} (Apple / Google Pay)`}
          onPress={request}
          disabled={!validation.ok}
        />
      </View>
      <Text style={{ color: "#5A5A66", fontSize: 11, marginTop: 10, textAlign: "center" }}>
        Real-world service — paid via Stripe + Apple/Google Pay, not in-app purchase.
      </Text>
    </ScrollView>
  );
}

// The escrow state both parties see, walked through the state machine (spec §8).
function EscrowView({
  status,
  amountCents,
  onAdvance,
}: {
  status: BookingStatus;
  amountCents: number;
  onAdvance: (s: BookingStatus) => void;
}) {
  const copy = STATUS_COPY[status];
  const held = ESCROW_HELD_STATES.includes(status);
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#0B0B0F" }} contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 42, textAlign: "center" }}>{held ? "🔒" : status === "completed" ? "✅" : "↩️"}</Text>
      <Text style={{ color: "#F4F4F8", fontSize: 24, fontWeight: "800", textAlign: "center", marginTop: 10 }}>
        {copy.label}
      </Text>
      <Text style={{ color: "#8A8A99", textAlign: "center", marginTop: 6 }}>{copy.blurb}</Text>

      <View
        style={{
          marginTop: 22,
          backgroundColor: "#16161D",
          borderRadius: 14,
          borderWidth: 1,
          borderColor: held ? "#8FE3FF" : "#2A2A36",
          padding: 16,
        }}
      >
        <Line label={held ? "Held in escrow" : "Booking amount"} value={formatPrice(amountCents)} bold />
        <Text style={{ color: "#8A8A99", fontSize: 12, marginTop: 6 }}>
          Both you and the artist see this status at every step.
        </Text>
      </View>

      {/* Demo controls to walk the state machine. */}
      {status === "funded" ? (
        <View style={{ marginTop: 18 }}>
          <Button label="Artist delivered → review" onPress={() => onAdvance("delivered")} />
        </View>
      ) : null}
      {status === "delivered" ? (
        <View style={{ marginTop: 18, gap: 10 }}>
          <Button label="Approve → release escrow" onPress={() => onAdvance("completed")} />
          <Button label="Request revision" variant="ghost" onPress={() => onAdvance("revision")} />
          <Button label="Open dispute" variant="love" onPress={() => onAdvance("disputed")} />
        </View>
      ) : null}
      {status === "revision" ? (
        <View style={{ marginTop: 18 }}>
          <Button label="Redelivered → review" onPress={() => onAdvance("delivered")} />
        </View>
      ) : null}
      {status === "disputed" ? (
        <View style={{ marginTop: 18, gap: 10 }}>
          <Text style={{ color: "#8A8A99", textAlign: "center" }}>Platform review:</Text>
          <Button label="Refund client" variant="love" onPress={() => onAdvance("refunded")} />
          <Button label="Release to artist" onPress={() => onAdvance("completed")} />
        </View>
      ) : null}
    </ScrollView>
  );
}

function Line({ label, value, muted, bold }: { label: string; value: string; muted?: boolean; bold?: boolean }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 }}>
      <Text style={{ color: muted ? "#8A8A99" : "#C9C9D4" }}>{label}</Text>
      <Text style={{ color: "#F4F4F8", fontWeight: bold ? "800" : "500" }}>{value}</Text>
    </View>
  );
}

function pricePresets(cap: number): number[] {
  const steps = [1500, 4000, 7500, 10000, 25000, 50000, 99900];
  const within = steps.filter((s) => s <= cap);
  return within.length ? within : [cap];
}
