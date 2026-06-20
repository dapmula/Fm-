import React from "react";
import { Pressable, Text, View, ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function Screen({ children, style, ...rest }: ViewProps) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0B0B0F" }}>
      <View style={[{ flex: 1, paddingHorizontal: 20 }, style]} {...rest}>
        {children}
      </View>
    </SafeAreaView>
  );
}

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled,
}: {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "ghost" | "love";
  disabled?: boolean;
}) {
  const bg = variant === "primary" ? "#7C5CFF" : variant === "love" ? "#FF4D6D" : "transparent";
  const border = variant === "ghost" ? "#2A2A36" : "transparent";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: disabled ? "#2A2A36" : bg,
        borderColor: border,
        borderWidth: variant === "ghost" ? 1 : 0,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <Text style={{ color: "#F4F4F8", fontWeight: "700", fontSize: 16 }}>{label}</Text>
    </Pressable>
  );
}

export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: active ? "#7C5CFF" : "#1F1F29",
        borderWidth: 1,
        borderColor: active ? "#7C5CFF" : "#2A2A36",
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      <Text style={{ color: active ? "#F4F4F8" : "#8A8A99", fontWeight: "600" }}>{label}</Text>
    </Pressable>
  );
}

export function H1({ children }: { children: React.ReactNode }) {
  return <Text style={{ color: "#F4F4F8", fontSize: 28, fontWeight: "800", marginBottom: 6 }}>{children}</Text>;
}

export function Sub({ children }: { children: React.ReactNode }) {
  return <Text style={{ color: "#8A8A99", fontSize: 15, marginBottom: 20 }}>{children}</Text>;
}
