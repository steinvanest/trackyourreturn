import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { RootStackParamList } from "./types";
import { HomeScreen } from "@/screens/HomeScreen";
import { AddPurchaseScreen } from "@/screens/AddPurchaseScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: "TrackYourReturn" }} />
        <Stack.Screen
          name="NieuweAankoop"
          component={AddPurchaseScreen}
          options={{ title: "Nieuwe aankoop" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
