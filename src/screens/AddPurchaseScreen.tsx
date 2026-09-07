import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../navigation/types";
import type { Retailer } from "../types/retourbeleid";
import { PRODUCT_CATEGORIEEN, type ProductCategorie } from "../types/aankopen";
import { RetailerPicker } from "../components/RetailerPicker";
import { berekenDeadlines, GeenGeldigeRegelError, vandaagIso } from "../utils/deadlines";
import { voegAankoopToe } from "../db/database";
import { genereerId } from "../utils/id";

const GEBRUIKER_ID = "lokale_gebruiker";
const ISO_DATUM_REGEX = /^\d{4}-\d{2}-\d{2}$/;

type Props = NativeStackScreenProps<RootStackParamList, "NieuweAankoop">;

export function AddPurchaseScreen({ navigation }: Props) {
  const [retailer, setRetailer] = useState<Retailer | null>(null);
  const [productNaam, setProductNaam] = useState("");
  const [categorie, setCategorie] = useState<ProductCategorie | null>(null);
  const [bedrag, setBedrag] = useState("");
  const [land, setLand] = useState("NL");
  const [aankoopdatum, setAankoopdatum] = useState(vandaagIso());
  const [leverdatum, setLeverdatum] = useState(vandaagIso());
  const [opslaan, setOpslaan] = useState(false);

  // Waarschuwing vóórdat er iets wordt opgeslagen: klopt de gekozen categorie met een
  // uitzondering van deze retailer (bv. software_media bij Coolblue)?
  const uitzonderingWaarschuwing = useMemo(() => {
    if (!retailer || !categorie) return null;
    return retailer.uitzonderingen.find((u) => u.categorie === categorie) ?? null;
  }, [retailer, categorie]);

  async function opslaanAankoop() {
    if (!retailer) {
      Alert.alert("Kies een retailer", "Selecteer eerst een retailer uit de lijst.");
      return;
    }
    if (!productNaam.trim()) {
      Alert.alert("Productnaam ontbreekt", "Vul een productnaam in.");
      return;
    }
    const bedragGetal = Number(bedrag.replace(",", "."));
    if (!Number.isFinite(bedragGetal) || bedragGetal < 0) {
      Alert.alert("Ongeldig bedrag", "Vul een geldig bedrag in, bv. 24.99.");
      return;
    }
    if (!ISO_DATUM_REGEX.test(aankoopdatum) || !ISO_DATUM_REGEX.test(leverdatum)) {
      Alert.alert("Ongeldige datum", "Gebruik het formaat JJJJ-MM-DD, bv. 2026-09-07.");
      return;
    }

    setOpslaan(true);
    try {
      const { aanmeld_deadline, verzend_deadline } = berekenDeadlines(
        { aankoopdatum, leverdatum, land },
        retailer
      );

      await voegAankoopToe({
        aankoop_id: genereerId(),
        gebruiker_id: GEBRUIKER_ID,
        retailer_id: retailer.retailer_id,
        product_naam: productNaam.trim(),
        product_categorie: categorie,
        bedrag: bedragGetal,
        aankoopdatum,
        leverdatum,
        land,
        status: "actief",
        verwijderd_op: null,
        verwijder_reden: null,
        berekende_aanmeld_deadline: aanmeld_deadline,
        berekende_verzend_deadline: verzend_deadline,
        herinneringen_verstuurd: [],
        notities: null,
      });

      navigation.goBack();
    } catch (fout) {
      if (fout instanceof GeenGeldigeRegelError) {
        Alert.alert("Geen retourbeleid bekend", fout.message);
      } else {
        Alert.alert("Opslaan mislukt", "Er ging iets mis, probeer het opnieuw.");
      }
    } finally {
      setOpslaan(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inhoud}>
      <Text style={styles.label}>Retailer</Text>
      <RetailerPicker geselecteerd={retailer} onSelecteer={setRetailer} />

      <Text style={styles.label}>Productnaam</Text>
      <TextInput
        style={styles.invoer}
        placeholder="bv. Winterjas maat M"
        value={productNaam}
        onChangeText={setProductNaam}
      />

      <Text style={styles.label}>Categorie (optioneel)</Text>
      <View style={styles.chipRij}>
        {PRODUCT_CATEGORIEEN.map((c) => (
          <Pressable
            key={c}
            style={[styles.chip, categorie === c && styles.chipActief]}
            onPress={() => setCategorie(categorie === c ? null : c)}
          >
            <Text style={[styles.chipTekst, categorie === c && styles.chipTekstActief]}>{c}</Text>
          </Pressable>
        ))}
      </View>

      {uitzonderingWaarschuwing && (
        <View style={styles.waarschuwing}>
          <Text style={styles.waarschuwingTekst}>
            Let op: {retailer?.retailer_naam} sluit "{uitzonderingWaarschuwing.categorie}" mogelijk uit
            van retour — {uitzonderingWaarschuwing.beschrijving}
          </Text>
        </View>
      )}

      <Text style={styles.label}>Bedrag (€)</Text>
      <TextInput
        style={styles.invoer}
        placeholder="24.99"
        keyboardType="decimal-pad"
        value={bedrag}
        onChangeText={setBedrag}
      />

      <Text style={styles.label}>Land</Text>
      <TextInput style={styles.invoer} value={land} onChangeText={(t) => setLand(t.toUpperCase())} maxLength={2} />

      <Text style={styles.label}>Aankoopdatum</Text>
      <TextInput style={styles.invoer} value={aankoopdatum} onChangeText={setAankoopdatum} placeholder="JJJJ-MM-DD" />

      <Text style={styles.label}>Leverdatum</Text>
      <TextInput style={styles.invoer} value={leverdatum} onChangeText={setLeverdatum} placeholder="JJJJ-MM-DD" />

      <Pressable style={styles.opslaanKnop} onPress={opslaanAankoop} disabled={opslaan}>
        <Text style={styles.opslaanKnopTekst}>{opslaan ? "Opslaan..." : "Aankoop opslaan"}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  inhoud: { padding: 16, gap: 6, paddingBottom: 48 },
  label: { fontSize: 13, fontWeight: "600", color: "#52525b", marginTop: 14, marginBottom: 4 },
  invoer: {
    borderWidth: 1,
    borderColor: "#d4d4d8",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: "#ffffff",
  },
  chipRij: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: "#d4d4d8",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#ffffff",
  },
  chipActief: { backgroundColor: "#18181b", borderColor: "#18181b" },
  chipTekst: { fontSize: 12, color: "#3f3f46" },
  chipTekstActief: { color: "#ffffff" },
  waarschuwing: {
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  waarschuwingTekst: { color: "#92400e", fontSize: 13 },
  opslaanKnop: {
    backgroundColor: "#18181b",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  opslaanKnopTekst: { color: "#ffffff", fontWeight: "600", fontSize: 15 },
});
