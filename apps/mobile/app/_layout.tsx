import { Stack } from "expo-router";

export default function RootLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: "#ffffff" },
                headerTintColor: "#172033",
                contentStyle: { backgroundColor: "#f5f7fb" },
            }}
        >
            <Stack.Screen
                name="index"
                options={{ title: "Shared Logbook" }}
            />
            <Stack.Screen
                name="entries/[id]"
                options={{ title: "Entry Details" }}
            />
        </Stack>
    );
}