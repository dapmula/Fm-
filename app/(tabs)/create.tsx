import React, { useState } from "react";
import { View, Text, TextInput, Image } from "react-native";
import { Screen, Button, Chip, H1, Sub } from "@/components/ui";
import { useSession } from "@/store/session";
import { CRAFTS } from "@/domain/crafts";
import type { Craft } from "@/domain/types";

// Create/Post: upload image (runs moderation BEFORE going live), caption, craft
// tag (spec §5). Images only for v1 (spec §13). Moderation pipeline (§11) runs
// in an Edge Function on upload; posts sit `pending` until cleared.
export default function Create() {
  const me = useSession((s) => s.me);
  const [caption, setCaption] = useState("");
  const [craft, setCraft] = useState<Craft | null>(me?.craft ?? null);
  const [picked, setPicked] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    // In production: upload to Supabase Storage → moderation Edge Function
    // (Rekognition + Hive/Thorn) → post created with moderation_status='pending'.
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Screen style={{ justifyContent: "center" }}>
        <Text style={{ fontSize: 44 }}>🛡️</Text>
        <H1>In review</H1>
        <Sub>
          Your post is being checked by moderation before it goes live. This usually takes a moment.
        </Sub>
        <Button label="Post another" variant="ghost" onPress={() => { setSubmitted(false); setPicked(false); setCaption(""); }} />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ paddingTop: 20 }}>
        <H1>New post</H1>
        <Sub>Images only for v1. Everything is moderated before it goes live.</Sub>

        <View
          onTouchEnd={() => setPicked(true)}
          style={{
            height: 220,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#2A2A36",
            borderStyle: "dashed",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#16161D",
            overflow: "hidden",
          }}
        >
          {picked ? (
            <Image source={{ uri: "https://picsum.photos/seed/fm-upload/600/400" }} style={{ width: "100%", height: "100%" }} />
          ) : (
            <Text style={{ color: "#8A8A99" }}>＋ Tap to add a photo</Text>
          )}
        </View>

        <TextInput
          placeholder="Write a caption…"
          placeholderTextColor="#5A5A66"
          value={caption}
          onChangeText={setCaption}
          style={{
            backgroundColor: "#1F1F29",
            color: "#F4F4F8",
            borderRadius: 12,
            padding: 14,
            marginTop: 14,
            minHeight: 60,
          }}
          multiline
        />

        <Text style={{ color: "#8A8A99", marginTop: 14, marginBottom: 6 }}>Craft tag</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {CRAFTS.slice(0, 8).map((c) => (
            <Chip key={c.craft} label={c.label} active={craft === c.craft} onPress={() => setCraft(c.craft)} />
          ))}
        </View>

        <View style={{ marginTop: 18 }}>
          <Button label="Post (runs moderation)" onPress={submit} disabled={!picked || !craft} />
        </View>
      </View>
    </Screen>
  );
}
