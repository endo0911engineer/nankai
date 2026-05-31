import { StyleSheet, Text, View } from "react-native";
import { Counter } from "../types";
import { calcRemainingTimes } from "../utils/calculations";

type Props = {
  counter: Counter;
};

export default function ShareCard({ counter }: Props) {
  const remaining = calcRemainingTimes(counter);

  return (
    <View style={styles.card}>
      <View style={styles.accentCircle} />
      <View style={styles.body}>
        <Text style={styles.label}>{counter.person_name}と</Text>
        <View style={styles.countRow}>
          <Text style={styles.prefix}>あと</Text>
          <Text style={styles.count}>{remaining}</Text>
          <Text style={styles.suffix}>回</Text>
        </View>
        <Text style={styles.event}>{counter.event_name}</Text>
      </View>
      <Text style={styles.appName}>あと何回</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 360, height: 360,
    backgroundColor: "#FBF8F3",
    justifyContent: "center", alignItems: "center",
    overflow: "hidden",
  },
  accentCircle: {
    position: "absolute", width: 280, height: 280, borderRadius: 140,
    backgroundColor: "#FDF2E8", top: -60, right: -80,
  },
  body: { alignItems: "center", gap: 4 },
  label: { fontFamily: "ZenMaruGothic_400Regular", fontSize: 22, color: "#7A6E68", marginBottom: 8 },
  countRow: { flexDirection: "row", alignItems: "flex-end", gap: 2 },
  prefix: { fontFamily: "ZenMaruGothic_400Regular", fontSize: 28, color: "#2C2C2C", paddingBottom: 10 },
  count: { fontFamily: "ZenMaruGothic_900Black", fontSize: 100, color: "#C4956A", lineHeight: 110 },
  suffix: { fontFamily: "ZenMaruGothic_400Regular", fontSize: 32, color: "#2C2C2C", paddingBottom: 14 },
  event: { fontFamily: "ZenMaruGothic_400Regular", fontSize: 22, color: "#7A6E68", marginTop: 8 },
  appName: {
    position: "absolute", bottom: 20, right: 24,
    fontFamily: "ZenMaruGothic_400Regular",
    fontSize: 13, color: "#C4B5A8", letterSpacing: 1,
  },
});
