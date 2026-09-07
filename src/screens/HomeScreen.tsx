import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../navigation/types";
import type { Aankoop } from "../types/aankopen";
import { haalAankopenOp, markeerVerlopenAankopen } from "../db/database";
import { relevanteDeadline, vandaagIso } from "../utils/deadlines";
import { vindRetailer } from "../data/retailers";
import { DeadlineBadge } from "../components/DeadlineBadge";

// Tot we echte gebruikersaccounts hebben, werkt de app met één vaste lokale gebruiker.
const GEBRUIKER_ID = "lokale_gebruiker";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export function HomeScreen({ navigation }: Props) {
  const [aankopen, setAankopen] = useState<Aankoop[]>([]);
  const [laden, setLaden] = useState(true);

  const laadAankopen = useCallback(async () => {
    await markeerVerlopenAankopen(vandaagIso());
    const data = await haalAankopenOp(GEBRUIKER_ID);
    setAankopen(data);
    setLaden(false);
  }, []);

  // Herlaadt de lijst elke keer dat dit scherm in beeld komt (bv. na het toevoegen van een aankoop).
  useFocusEffect(
    useCallback(() => {
      laadAankopen();
    }, [laadAankopen])
  );

  const zichtbareAankopen = aankopen.filter(
    (a) => a.status !== "handmatig_verwijderd" && a.status !== "retour_voltooid"
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={zichtbareAankopen}
        keyExtractor={(item) => item.aankoop_id}
        contentContainerStyle={styles.lijst}
        ListEmptyComponent={
          !laden ? (
            <Text style={styles.leegTekst}>
              Nog geen aankopen. Tik op "+ Nieuwe aankoop" om er een toe te voegen.
            </Text>
          ) : null
        }
        renderItem={({ item }) => {
          const retailer = vindRetailer(item.retailer_id);
          const { deadline, type } = relevanteDeadline(item);
          return (
            <View style={styles.kaart}>
              <View style={styles.kaartHeader}>
                <Text style={styles.productNaam}>{item.product_naam}</Text>
                <DeadlineBadge deadline={deadline} />
              </View>
              <Text style={styles.retailerNaam}>{retailer?.retailer_naam ?? item.retailer_id}</Text>
              <Text style={styles.deadlineType}>
                {type === "aanmelden" ? "Retour aanmelden vóór" : "Pakket versturen vóór"} {deadline}
              </Text>
            </View>
          );
        }}
      />
      <Pressable style={styles.knop} onPress={() => navigation.navigate("NieuweAankoop")}>
        <Text style={styles.knopTekst}>+ Nieuwe aankoop</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  lijst: { padding: 16, gap: 12 },
  leegTekst: { textAlign: "center", color: "#71717a", marginTop: 48 },
  kaart: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    gap: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  kaartHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  productNaam: { fontSize: 16, fontWeight: "600", color: "#18181b", flexShrink: 1 },
  retailerNaam: { fontSize: 14, color: "#52525b" },
  deadlineType: { fontSize: 12, color: "#a1a1aa" },
  knop: {
    backgroundColor: "#18181b",
    margin: 16,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  knopTekst: { color: "#ffffff", fontWeight: "600", fontSize: 15 },
});
