// Doorzoekbaar retailerveld: typ een naam, kies uit de gefilterde lijst.

import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { Retailer } from "@/types/retourbeleid";
import { alleRetailers } from "@/data/retailers";

interface Props {
  geselecteerd: Retailer | null;
  onSelecteer: (retailer: Retailer) => void;
}

export function RetailerPicker({ geselecteerd, onSelecteer }: Props) {
  const [zoekterm, setZoekterm] = useState("");
  const [openLijst, setOpenLijst] = useState(false);

  const gefilterd = useMemo(() => {
    const term = zoekterm.trim().toLowerCase();
    if (!term) return alleRetailers;
    return alleRetailers.filter((r) => r.retailer_naam.toLowerCase().includes(term));
  }, [zoekterm]);

  return (
    <View>
      <TextInput
        style={styles.invoer}
        placeholder="Zoek een retailer (bv. Zalando)"
        value={openLijst ? zoekterm : geselecteerd?.retailer_naam ?? zoekterm}
        onFocus={() => {
          setOpenLijst(true);
          setZoekterm("");
        }}
        onChangeText={setZoekterm}
      />
      {openLijst && (
        <View style={styles.dropdown}>
          <FlatList
            data={gefilterd}
            keyExtractor={(item) => item.retailer_id}
            keyboardShouldPersistTaps="handled"
            style={styles.dropdownLijst}
            ListEmptyComponent={<Text style={styles.geenResultaten}>Geen retailer gevonden.</Text>}
            renderItem={({ item }) => (
              <Pressable
                style={styles.optie}
                onPress={() => {
                  onSelecteer(item);
                  setOpenLijst(false);
                  setZoekterm("");
                }}
              >
                <Text style={styles.optieTekst}>{item.retailer_naam}</Text>
              </Pressable>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  invoer: {
    borderWidth: 1,
    borderColor: "#d4d4d8",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: "#ffffff",
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 10,
    marginTop: 4,
    backgroundColor: "#ffffff",
    maxHeight: 220,
  },
  dropdownLijst: { maxHeight: 220 },
  optie: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f4f4f5" },
  optieTekst: { fontSize: 15, color: "#18181b" },
  geenResultaten: { padding: 12, color: "#a1a1aa" },
});
