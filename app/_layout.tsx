import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  ZenMaruGothic_400Regular,
  ZenMaruGothic_700Bold,
  ZenMaruGothic_900Black,
} from "@expo-google-fonts/zen-maru-gothic";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    ZenMaruGothic_400Regular,
    ZenMaruGothic_700Bold,
    ZenMaruGothic_900Black,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#FBF8F3" },
          headerTintColor: "#2C2C2C",
          headerTitleStyle: { fontFamily: "ZenMaruGothic_700Bold", fontSize: 17 },
          contentStyle: { backgroundColor: "#FBF8F3" },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="index" options={{ title: "あと何回" }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="add" options={{ title: "カウンターを追加", presentation: "modal" }} />
        <Stack.Screen name="counter/[id]" options={{ title: "" }} />
        <Stack.Screen name="counter/edit/[id]" options={{ title: "編集", presentation: "modal" }} />
        <Stack.Screen name="memory/add" options={{ title: "思い出を記録", presentation: "modal" }} />
      </Stack>
    </>
  );
}
