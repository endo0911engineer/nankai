import { Pressable, StyleSheet, Text, View } from "react-native";
import { Counter } from "../types";
import { calcRemainingTimes, formatDate } from "../utils/calculations";

type Props = {
  counter: Counter;
  onPress: () => void;
};

export default function CounterCard({ counter, onPress }: Props) {
  const remaining = calcRemainingTimes(counter);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={styles.inner}>
        <View style={styles.left}>
          <Text style={styles.personTag}>{counter.person_name}</Text>
          <Text style={styles.eventName}>{counter.event_name}</Text>
          <Text style={styles.sentence}>
            あと<Text style={styles.countInline}>{remaining}</Text>回
          </Text>
          {counter.last_met_at && (
            <Text style={styles.lastMet}>{formatDate(counter.last_met_at)}</Text>
          )}
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeCount}>{remaining}</Text>
          <Text style={styles.badgeUnit}>回</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF", borderRadius: 20, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
  },
  cardPressed: { opacity: 0.88, transform: [{ scale: 0.984 }] },
  inner: { flexDirection: "row", alignItems: "center", padding: 20, gap: 16 },
  left: { flex: 1, gap: 3 },
  personTag: {
    fontFamily: "ZenMaruGothic_700Bold",
    fontSize: 12, color: "#C4956A", letterSpacing: 0.5,
  },
  eventName: {
    fontFamily: "ZenMaruGothic_700Bold",
    fontSize: 18, color: "#2C2C2C", marginTop: 2,
  },
  sentence: {
    fontFamily: "ZenMaruGothic_400Regular",
    fontSize: 14, color: "#9B9B9B", marginTop: 6,
  },
  countInline: {
    fontFamily: "ZenMaruGothic_700Bold",
    color: "#C4956A",
  },
  lastMet: {
    fontFamily: "ZenMaruGothic_400Regular",
    fontSize: 12, color: "#C0BAB4", marginTop: 2,
  },
  badge: {
    alignItems: "center", justifyContent: "center",
    backgroundColor: "#FDF2E8", borderRadius: 16, width: 84, height: 84,
  },
  badgeCount: {
    fontFamily: "ZenMaruGothic_900Black",
    fontSize: 34, color: "#C4956A", lineHeight: 40,
  },
  badgeUnit: {
    fontFamily: "ZenMaruGothic_700Bold",
    fontSize: 13, color: "#C4956A",
  },
});
