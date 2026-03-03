import { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  ActivityIndicator,
  ListRenderItemInfo,
  Dimensions,
  Modal,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

const { width } = Dimensions.get("window");
const CARD_SIZE = (width - 16 * 2 - 10 * 2) / 3;

const C = {
  primary:   "#0F3D3E",
  secondary: "#1F6F5C",
  accent:    "#E2C275",
  bg:        "#F0F4F3",
  card:      "#FFFFFF",
  text:      "#1a2e2e",
  muted:     "#6B8B8B",
  border:    "rgba(15,61,62,0.08)",
};

interface AsmaulHusna {
  id: number;
  arab: string;
  latin: string;
  arti: string;
  meaning?: string;
  transliteration?: string;
  [key: string]: unknown;
}

function s(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function normalize(raw: Record<string, unknown>, i: number): AsmaulHusna {
  return {
    id:    Number(raw.id ?? raw.number ?? raw.no ?? i + 1),
    arab:  s(raw.arab  ?? raw.arabic ?? raw.ar ?? raw.name_arabic),
    latin: s(raw.latin ?? raw.transliteration ?? raw.name_latin ?? raw.name),
    arti:  s(raw.arti  ?? raw.meaning ?? raw.terjemah ?? raw.translation ?? raw.arti_id),
  };
}

function extractArray(json: unknown): Record<string, unknown>[] {
  if (Array.isArray(json)) return json;
  if (json && typeof json === "object") {
    const obj = json as Record<string, unknown>;
    for (const val of Object.values(obj)) {
      if (Array.isArray(val)) return val as Record<string, unknown>[];
    }
  }
  return [];
}

export default function AsmaulHusnaScreen() {
  const [data, setData]     = useState<AsmaulHusna[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AsmaulHusna | null>(null);

  const load = () => {
    setStatus("loading");
    fetch("https://asmaul-husna-api.vercel.app/api/all")
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((json) => {
        const raw = extractArray(json);
        if (raw.length === 0) throw new Error("empty");
        setData(raw.map(normalize));
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (d) =>
        d.arab.includes(q) ||
        d.latin.toLowerCase().includes(q) ||
        d.arti.toLowerCase().includes(q)
    );
  }, [data, search]);

  const renderItem = ({ item }: ListRenderItemInfo<AsmaulHusna>) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.75}
      onPress={() => setSelected(item)}
    >
      <View style={styles.nomorWrap}>
        <Text style={styles.nomorText}>{item.id}</Text>
      </View>
      <Text style={styles.arabText} numberOfLines={2}>{item.arab}</Text>
      <Text style={styles.latinText} numberOfLines={1}>{item.latin}</Text>
      <Text style={styles.artiText} numberOfLines={2}>{item.arti}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.85)" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Asmaul Husna</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={load}>
          <Feather name="refresh-cw" size={17} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Feather name="search" size={15} color={C.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari arab, latin, arti..."
            placeholderTextColor="#b0c4c4"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="x" size={14} color={C.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* States */}
      {status === "loading" && (
        <View style={styles.stateWrap}>
          <ActivityIndicator size="large" color={C.secondary} />
          <Text style={styles.stateText}>Memuat Asmaul Husna...</Text>
        </View>
      )}

      {status === "error" && (
        <View style={styles.stateWrap}>
          <Feather name="wifi-off" size={44} color="#c5d5d5" />
          <Text style={styles.stateText}>Gagal memuat data</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={load}>
            <Text style={styles.retryText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      )}

      {status === "success" && filtered.length === 0 && (
        <View style={styles.stateWrap}>
          <Feather name="inbox" size={44} color="#c5d5d5" />
          <Text style={styles.stateText}>Tidak ditemukan</Text>
        </View>
      )}

      {status === "success" && filtered.length > 0 && (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          numColumns={3}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Detail Modal */}
      <Modal
        visible={!!selected}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelected(null)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalCard}>
            {selected && (
              <ScrollView showsVerticalScrollIndicator={false}>

                {/* Nomor */}
                <View style={styles.modalHeader}>
                  <View style={styles.modalNomor}>
                    <Text style={styles.modalNomorText}>{selected.id}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.modalClose}
                    onPress={() => setSelected(null)}
                  >
                    <Feather name="x" size={18} color={C.muted} />
                  </TouchableOpacity>
                </View>

                {/* Arab besar */}
                <View style={styles.modalArabWrap}>
                  <Text style={styles.modalArab}>{selected.arab}</Text>
                </View>

                {/* Divider */}
                <View style={styles.modalDivider} />

                {/* Latin */}
                <View style={styles.modalRow}>
                  <View style={[styles.modalDot, { backgroundColor: C.secondary }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalRowLabel}>Transliterasi</Text>
                    <Text style={styles.modalRowValue}>{selected.latin}</Text>
                  </View>
                </View>

                {/* Arti */}
                <View style={styles.modalRow}>
                  <View style={[styles.modalDot, { backgroundColor: "#c9972a" }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalRowLabel}>Artinya</Text>
                    <Text style={styles.modalRowValue}>{selected.arti}</Text>
                  </View>
                </View>

                {/* Nav prev/next */}
                <View style={styles.modalNav}>
                  <TouchableOpacity
                    style={[styles.modalNavBtn, selected.id <= 1 && { opacity: 0.3 }]}
                    disabled={selected.id <= 1}
                    onPress={() => {
                      const prev = data.find((d) => d.id === selected.id - 1);
                      if (prev) setSelected(prev);
                    }}
                  >
                    <Feather name="chevron-left" size={18} color={C.secondary} />
                    <Text style={styles.modalNavText}>Sebelumnya</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalNavBtn, selected.id >= 99 && { opacity: 0.3 }]}
                    disabled={selected.id >= 99}
                    onPress={() => {
                      const next = data.find((d) => d.id === selected.id + 1);
                      if (next) setSelected(next);
                    }}
                  >
                    <Text style={styles.modalNavText}>Berikutnya</Text>
                    <Feather name="chevron-right" size={18} color={C.secondary} />
                  </TouchableOpacity>
                </View>

              </ScrollView>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  stateWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
  stateText: { fontSize: 14, color: C.muted, fontWeight: "500" },
  retryBtn: { backgroundColor: C.secondary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  retryText: { color: "#fff", fontSize: 13, fontWeight: "700" },

  // Header
  header: {
    backgroundColor: C.primary,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 18,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  iconBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 18, color: "#fff", fontWeight: "700" },

  // Search
  searchWrap: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  searchBox: {
    backgroundColor: C.card, borderRadius: 12,
    paddingHorizontal: 13, paddingVertical: 11,
    flexDirection: "row", alignItems: "center", gap: 9,
    borderWidth: 1, borderColor: C.border,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 13, color: C.text, padding: 0 },

  // Grid
  listContent: { paddingHorizontal: 16, paddingBottom: 32 },
  row: { gap: 10, marginBottom: 10 },

  // Card
  card: {
    width: CARD_SIZE,
    backgroundColor: C.card,
    borderRadius: 14, padding: 10,
    alignItems: "center",
    borderWidth: 1, borderColor: C.border,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    position: "relative",
    minHeight: 110,
  },
  nomorWrap: {
    position: "absolute", top: 7, left: 8,
    width: 20, height: 20, borderRadius: 6,
    backgroundColor: "#e8f5f0",
    alignItems: "center", justifyContent: "center",
  },
  nomorText: { fontSize: 9, fontWeight: "700", color: C.secondary },
  arabText: {
    fontSize: 20, color: C.text, fontWeight: "700",
    textAlign: "center", marginTop: 18, marginBottom: 4, lineHeight: 30,
  },
  latinText: {
    fontSize: 11, color: C.secondary, fontWeight: "700",
    textAlign: "center", marginBottom: 2,
  },
  artiText: {
    fontSize: 10, color: C.muted, textAlign: "center", lineHeight: 14,
  },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center", justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%", backgroundColor: C.card,
    borderRadius: 24, padding: 24,
    maxHeight: "80%",
    shadowColor: "#000", shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2, shadowRadius: 24, elevation: 16,
  },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 16,
  },
  modalNomor: {
    width: 36, height: 36, borderRadius: 11,
    backgroundColor: "#e8f5f0",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(31,111,92,0.15)",
  },
  modalNomorText: { fontSize: 14, fontWeight: "700", color: C.secondary },
  modalClose: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: C.bg,
    alignItems: "center", justifyContent: "center",
  },
  modalArabWrap: {
    backgroundColor: C.primary, borderRadius: 18,
    paddingVertical: 24, paddingHorizontal: 16,
    alignItems: "center", marginBottom: 20,
  },
  modalArab: {
    fontSize: 38, color: C.accent, fontWeight: "700",
    textAlign: "center", lineHeight: 58,
  },
  modalDivider: { height: 1, backgroundColor: C.border, marginBottom: 16 },
  modalRow: {
    flexDirection: "row", gap: 12,
    alignItems: "flex-start", marginBottom: 16,
  },
  modalDot: {
    width: 4, height: 20, borderRadius: 2, marginTop: 2, flexShrink: 0,
  },
  modalRowLabel: {
    fontSize: 11, color: C.muted, fontWeight: "700",
    textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4,
  },
  modalRowValue: {
    fontSize: 16, color: C.text, fontWeight: "600", lineHeight: 24,
  },
  modalNav: {
    flexDirection: "row", justifyContent: "space-between",
    borderTopWidth: 1, borderTopColor: C.border,
    paddingTop: 14, marginTop: 4,
  },
  modalNavBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  modalNavText: { fontSize: 13, color: C.secondary, fontWeight: "700" },
});