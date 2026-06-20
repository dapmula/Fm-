import React from "react";
import { View, Text, Dimensions, ActivityIndicator } from "react-native";
import { FlatList } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { fetchFeed } from "@/data/repo";
import { FeedCard } from "@/components/FeedCard";

const { height } = Dimensions.get("window");

// Feed (default tab): full-screen vertical TikTok/IG scroll of posts (spec §5).
export default function Feed() {
  const { data, isLoading } = useQuery({ queryKey: ["feed"], queryFn: fetchFeed });

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000", justifyContent: "center" }}>
        <ActivityIndicator color="#7C5CFF" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <FlatList
        data={data ?? []}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => <FeedCard post={item} />}
        pagingEnabled
        snapToInterval={height}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        getItemLayout={(_, index) => ({ length: height, offset: height * index, index })}
        windowSize={3}
      />
    </View>
  );
}
