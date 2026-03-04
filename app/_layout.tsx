import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SettingsProvider } from "../src/contexts/SettingsContext";
import { WorkoutProvider } from "../src/contexts/WorkoutContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <WorkoutProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }} />
        </WorkoutProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
