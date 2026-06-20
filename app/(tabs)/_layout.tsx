import React from "react";
import { Text } from "react-native";
import { Tabs } from "expo-router";

function icon(emoji: string) {
  return ({ color }: { color: string }) => (
    <Text style={{ fontSize: 22, color, opacity: color === "#7C5CFF" ? 1 : 0.6 }}>{emoji}</Text>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#0B0B0F", borderTopColor: "#1F1F29" },
        tabBarActiveTintColor: "#7C5CFF",
        tabBarInactiveTintColor: "#8A8A99",
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Feed", tabBarIcon: icon("🏠") }} />
      <Tabs.Screen name="discover" options={{ title: "Discover", tabBarIcon: icon("🧭") }} />
      <Tabs.Screen name="create" options={{ title: "Create", tabBarIcon: icon("➕") }} />
      <Tabs.Screen name="notifications" options={{ title: "Alerts", tabBarIcon: icon("🔔") }} />
      <Tabs.Screen name="me" options={{ title: "Me", tabBarIcon: icon("👤") }} />
    </Tabs>
  );
}
