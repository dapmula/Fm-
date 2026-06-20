import React, { useState } from "react";
import { View, Text, TextInput } from "react-native";
import { router } from "expo-router";
import { Screen, Button, H1, Sub } from "@/components/ui";
import { useSession } from "@/store/session";

// Step 3 — Profile basics (FB): display name, handle, photo, short bio
// (spec §4.3). A placeholder AI avatar is offered.
export default function ProfileBasics() {
  const patchDraft = useSession((s) => s.patchDraft);
  const draft = useSession((s) => s.draft);
  const [displayName, setName] = useState(draft.displayName);
  const [handle, setHandle] = useState(draft.handle);
  const [bio, setBio] = useState(draft.bio);

  const valid = displayName.trim().length > 1 && handle.trim().length > 1;

  const next = () => {
    patchDraft({
      displayName: displayName.trim(),
      handle: handle.trim().replace(/^@/, ""),
      bio: bio.trim(),
      avatarUrl: draft.avatarUrl ?? "https://picsum.photos/seed/fm-new-avatar/240/240",
    });
    router.push("/(onboarding)/craft");
  };

  return (
    <Screen>
      <View style={{ paddingTop: 20 }}>
        <H1>Build your profile</H1>
        <Sub>This is your FM card. Make it you.</Sub>

        <Field label="Display name" value={displayName} onChange={setName} placeholder="Mula" />
        <Field
          label="Handle"
          value={handle}
          onChange={setHandle}
          placeholder="@yourhandle"
          autoCapitalize="none"
        />
        <Field label="Bio" value={bio} onChange={setBio} placeholder="What you do" multiline />

        <View style={{ marginTop: 20 }}>
          <Button label="Next: pick your craft" onPress={next} disabled={!valid} />
        </View>
      </View>
    </Screen>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  placeholder: string;
  multiline?: boolean;
  autoCapitalize?: "none" | "sentences";
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ color: "#8A8A99", marginBottom: 6 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#5A5A66"
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        style={{
          backgroundColor: "#1F1F29",
          color: "#F4F4F8",
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
          minHeight: multiline ? 72 : undefined,
        }}
      />
    </View>
  );
}
