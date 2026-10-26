import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { api, Entry } from "../api";

export default function HomeScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadEntries = useCallback(async () => {
    try {
      setError("");
      const result = await api.listEntries();
      setEntries(result.entries);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load entries",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  async function createEntry() {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Missing information", "Enter a title and description.");
      return;
    }

    try {
      setSaving(true);
      const result = await api.createEntry(title, content);
      setTitle("");
      setContent("");
      setEntries((current) => [
        result.entry,
        ...current.filter((item) => item.id !== result.entry.id),
      ]);
    } catch (err) {
      Alert.alert(
        "Could not create entry",
        err instanceof Error ? err.message : "Try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.container}
      data={entries}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            void loadEntries();
          }}
        />
      }
      ListHeaderComponent={
        <View>
          <Text style={styles.heading}>Shared Logbook</Text>
          <Text style={styles.subtitle}>
            One place for updates, records, and notes.
          </Text>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>New entry</Text>
            <TextInput
              style={styles.input}
              placeholder="Entry title"
              value={title}
              onChangeText={setTitle}
              maxLength={120}
            />
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="What would you like to record?"
              value={content}
              onChangeText={setContent}
              multiline
              maxLength={5000}
              textAlignVertical="top"
            />
            <Pressable
              style={[styles.button, saving && styles.disabled]}
              disabled={saving}
              onPress={() => void createEntry()}
            >
              <Text style={styles.buttonText}>
                {saving ? "Saving..." : "Publish entry"}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>Recent entries</Text>
          {loading && <ActivityIndicator style={styles.loader} />}
          {!!error && (
            <Text style={styles.error}>
              {error}{" "}
              <Text onPress={() => void loadEntries()}>Retry</Text>
            </Text>
          )}
          {!loading && !error && entries.length === 0 && (
            <Text style={styles.empty}>
              No entries yet. Create the first one above.
            </Text>
          )}
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          style={styles.entry}
          onPress={() =>
            router.push({
              pathname: "/entries/[id]",
              params: { id: item.id },
            })
          }
        >
          <Text style={styles.entryTitle}>{item.title}</Text>
          <Text style={styles.entryContent} numberOfLines={3}>
            {item.content}
          </Text>
          <Text style={styles.date}>
            {new Date(item.createdAt).toLocaleString()}
          </Text>
          <Text style={styles.link}>View entry and notes →</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { padding: 20, paddingBottom: 48 },
  heading: { fontSize: 28, fontWeight: "800", color: "#172033" },
  subtitle: { color: "#64748b", marginTop: 6, marginBottom: 20 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#172033",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#f5f7fb",
    borderRadius: 10,
    padding: 13,
    fontSize: 15,
    color: "#172033",
  },
  multiline: { minHeight: 110 },
  button: {
    backgroundColor: "#3157d5",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  disabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontWeight: "700" },
  loader: { marginVertical: 20 },
  error: { color: "#b91c1c", marginBottom: 16 },
  empty: { color: "#64748b", marginBottom: 20 },
  entry: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  entryTitle: { fontSize: 17, fontWeight: "700", color: "#172033" },
  entryContent: { color: "#475569", marginTop: 8, lineHeight: 21 },
  date: { fontSize: 12, color: "#64748b", marginTop: 12 },
  link: { color: "#3157d5", fontWeight: "600", marginTop: 12 },
});