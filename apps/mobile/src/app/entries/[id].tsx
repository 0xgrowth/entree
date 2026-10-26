import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { api, Entry, Note } from "../../api";

export default function EntryDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [entry, setEntry] = useState<Entry | null>(null);
    const [notes, setNotes] = useState<Note[]>([]);
    const [draft, setDraft] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        if (!id) return;

        try {
            setError("");
            const result = await api.getEntry(id);
            setEntry(result.entry);
            setNotes(result.notes);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to load entry");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        void load();
    }, [load]);

    async function postNote() {
        if (!id || !draft.trim()) {
            Alert.alert("Empty note", "Enter a note before posting.");
            return;
        }

        try {
            setSaving(true);
            const result = await api.createNote(id, draft.trim());
            setNotes((current) => [
                result.note,
                ...current.filter((note) => note.id !== result.note.id),
            ]);
            setDraft("");
        } catch (err) {
            Alert.alert(
                "Could not post note",
                err instanceof Error ? err.message : "Try again.",
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <ActivityIndicator style={styles.loader} size="large" />;
    }

    if (error || !entry) {
        return (
            <View style={styles.container}>
                <Text style={styles.error}>{error || "Entry not found"}</Text>
                <Text style={styles.link} onPress={() => void load()}>
                    Try again
                </Text>
            </View>
        );
    }

    return (
        <FlatList
            style={styles.screen}
            contentContainerStyle={styles.container}
            data={notes}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={
                <View>
                    <View style={styles.card}>
                        <Text style={styles.title}>{entry.title}</Text>
                        <Text style={styles.content}>{entry.content}</Text>
                        <Text style={styles.date}>
                            Created {new Date(entry.createdAt).toLocaleString()}
                        </Text>
                    </View>

                    <Text style={styles.heading}>Add a note</Text>
                    <View style={styles.card}>
                        <TextInput
                            value={draft}
                            onChangeText={setDraft}
                            placeholder="Write an update or comment..."
                            multiline
                            maxLength={2000}
                            textAlignVertical="top"
                            style={styles.input}
                        />
                        <Pressable
                            disabled={saving}
                            style={[styles.button, saving && styles.disabled]}
                            onPress={() => void postNote()}
                        >
                            <Text style={styles.buttonText}>
                                {saving ? "Posting..." : "Post note"}
                            </Text>
                        </Pressable>
                    </View>

                    <Text style={styles.heading}>Notes ({notes.length})</Text>
                    {notes.length === 0 && (
                        <Text style={styles.empty}>No notes yet. Start the discussion.</Text>
                    )}
                </View>
            }
            renderItem={({ item }) => (
                <View style={styles.note}>
                    <Text style={styles.content}>{item.content}</Text>
                    <Text style={styles.date}>
                        {new Date(item.createdAt).toLocaleString()}
                    </Text>
                </View>
            )}
        />
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    container: { padding: 20, paddingBottom: 40 },
    loader: { flex: 1 },
    card: {
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 16,
        marginBottom: 22,
        gap: 12,
    },
    title: { fontSize: 24, fontWeight: "800", color: "#172033" },
    heading: {
        fontSize: 18,
        fontWeight: "700",
        color: "#172033",
        marginBottom: 12,
    },
    content: { fontSize: 15, lineHeight: 23, color: "#334155" },
    date: { fontSize: 12, color: "#64748b", marginTop: 10 },
    input: {
        minHeight: 100,
        backgroundColor: "#f5f7fb",
        padding: 12,
        borderRadius: 10,
        fontSize: 15,
    },
    button: {
        backgroundColor: "#3157d5",
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
    },
    disabled: { opacity: 0.6 },
    buttonText: { color: "#fff", fontWeight: "700" },
    note: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    empty: { color: "#64748b", marginBottom: 18 },
    error: { color: "#b91c1c", marginBottom: 12 },
    link: { color: "#3157d5", fontWeight: "600" },
});