import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";

import { RootNavigator } from "./src/navigation/RootNavigator";
import { initDatabase } from "./src/db/database";

export default function App() {
  const [klaar, setKlaar] = useState(false);

  useEffect(() => {
    initDatabase().then(() => setKlaar(true));
  }, []);

  if (!klaar) {
    return (
      <View style={styles.laadscherm}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <RootNavigator />
    </>
  );
}

const styles = StyleSheet.create({
  laadscherm: { flex: 1, alignItems: "center", justifyContent: "center" },
});
