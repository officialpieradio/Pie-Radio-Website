import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { MobileAudioProvider } from "../context/mobile-audio-context";

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <MobileAudioProvider>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(tabs)" />
                </Stack>
                <StatusBar style="light" />
            </MobileAudioProvider>
        </SafeAreaProvider>
    );
}
