// Kleurgecodeerde badge voor de retourdeadline: rood <3 dagen, oranje <7 dagen, groen daarna.

import { StyleSheet, Text, View } from "react-native";
import { bepaalUrgentie, dagenTotDeadline, type DeadlineUrgentie } from "../utils/deadlines";

const KLEUREN: Record<DeadlineUrgentie, { achtergrond: string; tekst: string }> = {
  verlopen: { achtergrond: "#3f3f46", tekst: "#ffffff" },
  rood: { achtergrond: "#fee2e2", tekst: "#b91c1c" },
  oranje: { achtergrond: "#ffedd5", tekst: "#c2410c" },
  groen: { achtergrond: "#dcfce7", tekst: "#15803d" },
};

function labelVoorDagen(dagenOver: number): string {
  if (dagenOver < 0) return `Verlopen (${Math.abs(dagenOver)}d geleden)`;
  if (dagenOver === 0) return "Vandaag laatste dag";
  if (dagenOver === 1) return "Nog 1 dag";
  return `Nog ${dagenOver} dagen`;
}

interface Props {
  deadline: string; // ISO-datum
  vandaag?: string; // optioneel, vooral handig voor tests/preview
}

export function DeadlineBadge({ deadline, vandaag }: Props) {
  const dagenOver = dagenTotDeadline(deadline, vandaag);
  const urgentie = bepaalUrgentie(dagenOver);
  const kleur = KLEUREN[urgentie];

  return (
    <View style={[styles.badge, { backgroundColor: kleur.achtergrond }]}>
      <Text style={[styles.tekst, { color: kleur.tekst }]}>{labelVoorDagen(dagenOver)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  tekst: {
    fontSize: 12,
    fontWeight: "600",
  },
});
