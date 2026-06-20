import React from "react";
import { View, Text, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Notifications: new follows, badge level-ups (ring-burst), booking status,
// love milestones, new DMs, promo results (spec §5/§15). Delivered via Expo
// Notifications (APNs/FCM) in production; this is the in-app inbox.
interface Notif {
  id: string;
  icon: string;
  title: string;
  body: string;
  when: string;
}

const DEMO: Notif[] = [
  { id: "1", icon: "🏆", title: "Badge level-up!", body: "Your Steady Flow badge climbed to Silver.", when: "2m" },
  { id: "2", icon: "❤️", title: "Love milestone", body: "Your latest post passed 500 likes.", when: "1h" },
  { id: "3", icon: "👤", title: "New follower", body: "Aria Bell started following you.", when: "3h" },
  { id: "4", icon: "💸", title: "Booking funded", body: "Kai Monroe funded your $75 feature — funds secured in escrow.", when: "5h" },
  { id: "5", icon: "💬", title: "New message", body: "Trey Banks sent you a message.", when: "1d" },
];

export default function Notifications() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0B0B0F" }}>
      <Text style={{ color: "#F4F4F8", fontSize: 26, fontWeight: "800", padding: 16 }}>
        Activity
      </Text>
      <FlatList
        data={DEMO}
        keyExtractor={(n) => n.id}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              borderBottomColor: "#1F1F29",
              borderBottomWidth: 1,
            }}
          >
            <Text style={{ fontSize: 24 }}>{item.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#F4F4F8", fontWeight: "700" }}>{item.title}</Text>
              <Text style={{ color: "#8A8A99" }}>{item.body}</Text>
            </View>
            <Text style={{ color: "#5A5A66", fontSize: 12 }}>{item.when}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
