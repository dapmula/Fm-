import React, { useEffect } from "react";
import { View, Text, AccessibilityInfo } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop, G } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  cancelAnimation,
  useReducedMotion,
} from "react-native-reanimated";
import type { Tier } from "@/domain/types";
import { tierStyle } from "@/theme/tiers";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  tier: Tier;
  // 0..1 fill toward the next tier (spec §6 — ring fills, never a number).
  fraction: number;
  size?: number;
  // The crest face (emoji stand-in until SVG crest art ships, spec §8).
  icon?: string;
  label?: string;
}

// The crest = an SVG progress ring + per-tier glow/motion (spec §6):
//   Bronze  → soft steady glow
//   Silver  → slow shimmer sweep
//   Gold    → pulsing glow breathing
//   Diamond → sparkle + rotating shine + subtle scale "breathe"
// Respects prefers-reduced-motion.
export function BadgeRing({ tier, fraction, size = 96, icon = "🏆", label }: Props) {
  const style = tierStyle(tier);
  const stroke = Math.max(5, size * 0.07);
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(1, Math.max(0, fraction));

  const reduceMotion = useReducedMotion();

  // Animated fill of the ring.
  const progress = useSharedValue(0);
  // Tier-specific motion drivers.
  const glow = useSharedValue(0.5);
  const breathe = useSharedValue(1);

  useEffect(() => {
    progress.value = withTiming(clamped, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [clamped, progress]);

  useEffect(() => {
    cancelAnimation(glow);
    cancelAnimation(breathe);

    if (reduceMotion) {
      glow.value = 0.7;
      breathe.value = 1;
      return;
    }

    switch (style.motion) {
      case "steady":
        glow.value = withTiming(0.6, { duration: 600 });
        break;
      case "shimmer":
        glow.value = withRepeat(withTiming(0.95, { duration: 2200, easing: Easing.inOut(Easing.ease) }), -1, true);
        break;
      case "pulse":
        glow.value = withRepeat(withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }), -1, true);
        break;
      case "sparkle":
        glow.value = withRepeat(withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }), -1, true);
        breathe.value = withRepeat(
          withSequence(
            withTiming(1.04, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
          ),
          -1,
          false,
        );
        break;
    }
    return () => {
      cancelAnimation(glow);
      cancelAnimation(breathe);
    };
  }, [style.motion, reduceMotion, glow, breathe]);

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0.35 + glow.value * 0.5,
    shadowRadius: 6 + glow.value * 14,
    transform: [{ scale: breathe.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: style.glow,
          shadowOffset: { width: 0, height: 0 },
        },
        glowStyle,
      ]}
      accessibilityRole="image"
      accessibilityLabel={`${style.label} tier${label ? ` ${label}` : ""}, ${Math.round(clamped * 100)} percent to next tier`}
    >
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id={`ring-${tier}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={style.ring[0]} />
            <Stop offset="1" stopColor={style.ring[1]} />
          </LinearGradient>
        </Defs>
        {/* Track */}
        <Circle cx={cx} cy={cy} r={r} stroke="#2A2A36" strokeWidth={stroke} fill="none" />
        {/* Progress fill */}
        <G rotation={-90} origin={`${cx}, ${cy}`}>
          <AnimatedCircle
            cx={cx}
            cy={cy}
            r={r}
            stroke={`url(#ring-${tier})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            animatedProps={ringProps}
          />
        </G>
      </Svg>
      {/* Crest face */}
      <View style={{ position: "absolute", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: size * 0.34 }}>{icon}</Text>
        {tier === "diamond" ? <Sparkles size={size} /> : null}
      </View>
    </Animated.View>
  );
}

// Diamond-only twinkling particles overlaid on the ring (spec §6). This is the
// flex tier — make it unmistakable.
function Sparkles({ size }: { size: number }) {
  const reduceMotion = useReducedMotion();
  const positions = [
    { top: size * 0.08, left: size * 0.2 },
    { top: size * 0.18, left: size * 0.74 },
    { top: size * 0.72, left: size * 0.14 },
    { top: size * 0.78, left: size * 0.7 },
  ];
  return (
    <>
      {positions.map((pos, i) => (
        <Sparkle key={i} pos={pos} delay={i * 350} reduceMotion={reduceMotion} />
      ))}
    </>
  );
}

function Sparkle({
  pos,
  delay,
  reduceMotion,
}: {
  pos: { top: number; left: number };
  delay: number;
  reduceMotion: boolean;
}) {
  const o = useSharedValue(reduceMotion ? 0.8 : 0);
  useEffect(() => {
    if (reduceMotion) return;
    o.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600 }),
        withTiming(0.1, { duration: 600 }),
      ),
      -1,
      false,
    );
  }, [o, reduceMotion]);
  const aStyle = useAnimatedStyle(() => ({ opacity: o.value }));
  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: pos.top,
          left: pos.left,
          width: 5,
          height: 5,
          borderRadius: 3,
          backgroundColor: "#FFFFFF",
        },
        aStyle,
      ]}
    />
  );
}

// Fire when a badge levels up: complete the circle, flash, then settle (spec §6).
export function announceLevelUp(tier: Tier) {
  AccessibilityInfo.announceForAccessibility?.(`Leveled up to ${tierStyle(tier).label}!`);
}
