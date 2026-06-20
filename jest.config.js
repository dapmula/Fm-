module.exports = {
  preset: "jest-expo",
  // The domain logic is pure TS and the primary test target. RN component tests
  // can be added under src/components/__tests__ with the same preset.
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@react-navigation/.*|nativewind|react-native-svg|react-native-reanimated))",
  ],
};
