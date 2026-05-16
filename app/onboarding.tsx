import { useCallback, useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = "onboarding_completed";

export default function OnboardingScreen() {
  const fadeTitle = useRef(new Animated.Value(0)).current;
  const fadeSubtitle = useRef(new Animated.Value(0)).current;
  const fadeButton = useRef(new Animated.Value(0)).current;

  // カウンター作成完了後にここへ戻ってきたらホームへ
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(ONBOARDING_KEY).then((done) => {
        if (done) router.replace("/");
      });
    }, [])
  );

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeTitle, { toValue: 1, duration: 1000, delay: 300, useNativeDriver: true }),
      Animated.timing(fadeSubtitle, { toValue: 1, duration: 900, delay: 200, useNativeDriver: true }),
      Animated.timing(fadeButton, { toValue: 1, duration: 700, delay: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSkip = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <Pressable style={styles.skipBtn} onPress={handleSkip}>
        <Text style={styles.skipText}>スキップ</Text>
      </Pressable>

      <View style={styles.content}>
        <Animated.View style={{ opacity: fadeTitle }}>
          <Text style={styles.title}>
            大切な人と、{"\n"}あと何回{"\n"}会えるだろう。
          </Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.buttonWrapper, { opacity: fadeButton }]}>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}
          onPress={() => router.push({ pathname: "/add", params: { fromOnboarding: "true" } })}
        >
          <Text style={styles.buttonText}>はじめる</Text>
        </Pressable>
        <Text style={styles.hint}>大切な人を1人思い浮かべてください</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBF8F3",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 32,
  },
  circle1: {
    position: "absolute", width: 320, height: 320, borderRadius: 160,
    backgroundColor: "#FDF2E8", top: -80, right: -80,
  },
  circle2: {
    position: "absolute", width: 200, height: 200, borderRadius: 100,
    backgroundColor: "#FDF2E8", bottom: 60, left: -60, opacity: 0.6,
  },
  skipBtn: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  skipText: {
    fontFamily: "ZenMaruGothic_400Regular",
    fontSize: 15,
    color: "#C0BAB4",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    gap: 32,
  },
  title: {
    fontFamily: "ZenMaruGothic_900Black",
    fontSize: 38,
    color: "#2C2C2C",
    lineHeight: 58,
  },
  subtitle: {
    fontFamily: "ZenMaruGothic_400Regular",
    fontSize: 17,
    color: "#9B9B9B",
    lineHeight: 28,
  },
  buttonWrapper: {
    gap: 14,
    alignItems: "center",
  },
  button: {
    backgroundColor: "#C4956A",
    borderRadius: 16,
    paddingVertical: 18,
    width: "100%",
    alignItems: "center",
    shadowColor: "#C4956A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    fontFamily: "ZenMaruGothic_700Bold",
    fontSize: 18,
    color: "#FFFFFF",
  },
  hint: {
    fontFamily: "ZenMaruGothic_400Regular",
    fontSize: 13,
    color: "#C0BAB4",
  },
});
