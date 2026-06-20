import React from "react";
import { View, Text } from "react-native";
import Slider from "@react-native-community/slider";

// Radius slider — appears on login, Discover, and Settings; default 25mi,
// changeable any time (spec §4/§12). 1–100 mi range.
export function RadiusSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (mi: number) => void;
}) {
  return (
    <View>
      <Text style={{ color: "#8A8A99", fontSize: 14, marginBottom: 4 }}>
        See talent within
      </Text>
      <Text style={{ color: "#F4F4F8", fontSize: 22, fontWeight: "800", marginBottom: 8 }}>
        {Math.round(value)} mi
      </Text>
      <Slider
        minimumValue={1}
        maximumValue={100}
        step={1}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor="#7C5CFF"
        maximumTrackTintColor="#2A2A36"
        thumbTintColor="#7C5CFF"
      />
    </View>
  );
}
