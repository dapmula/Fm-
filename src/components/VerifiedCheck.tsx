import React from "react";
import { View, Text } from "react-native";

// The "certified check" — paid/admin-granted verification (spec §9/§14).
export function VerifiedCheck({ size = 14 }: { size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#1D9BF0",
        alignItems: "center",
        justifyContent: "center",
      }}
      accessibilityLabel="Certified"
    >
      <Text style={{ color: "white", fontSize: size * 0.7, fontWeight: "900", lineHeight: size }}>
        ✓
      </Text>
    </View>
  );
}
