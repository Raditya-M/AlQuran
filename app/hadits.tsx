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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

// ── THEME ──────────────────────────────────────────────
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

// ── TYPES ──────────────────────────────────────────────
interface RawHadits {
  [key: string]: unknown;
}

interface Hadits {
  key: string;
  judul: string;
  arab: string;
  indonesia: string;
  perawi: string;
}

// ── HELPER ─────────────────────────────────────────────
function str(val: unknown): string {
  if (typeof val === "string") return val.trim();
  if (typeof val === "number") return String(val);
  return "";
}

function parseHadits(raw: RawHadits[]): Hadits[] {
  return raw.map((item, i) => ({
    key:       str(item.id ?? item._id ?? i),
    judul:     str(item.judul ?? item.title ?? item.name) || `Hadits ${i + 1}`,
    arab:      str(item.arab ?? item.arabic ?? item.ar),
    indonesia: str(item.indonesia ?? item.terjemah ?? item.content ?? item.text),
    perawi:    str(item.perawi ?? item.narrator ?? item.rawi ?? item.source),
  }));
}

function extractArray(json: unknown): RawHadits[] {
  if (Array.isArray(json)) return json as RawHadits[];
  if (json && typeof json === "object") {
    const obj = json as Record<string, unknown>;
    for (const val of Object.values(obj)) {
      if (Array.isArray(val)) return val as RawHadits[];
    }
  }
  return [];
}

// ── SCREEN ─────────────────────────────────────────────
export default function HaditsScreen() {
  const [data, setData]       = useState<Hadits[]>([]);
  const [status, setStatus]   = useState<"loading" | "success" | "error">("loading");
  const [search, setSearch]   = useState("");
  const [saved, setSaved]     = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("https://muslim-api-three.vercel.app/v1/hadits")
      .then((res) => {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then((json) => {
        const raw = extractArray(json);
        if (raw.length === 0) throw new Error("Empty");
        setData(parseHadits(raw));
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, []);

  const toggleSaved = (key: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (d) => d.judul.toLowerCase().includes(q) || d.indonesia.toLowerCase().includes(q)
    );
  }, [data, search]);

  // ── RENDER ITEM ──
  const renderItem = ({ item, index }: ListRenderItemInfo<Hadits>) => {
    const isSaved = saved.has(item.key);
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => router.push({ pathname: "/hadits/[id]", params: { index: String(index) } })}
      >

        {/* Card header: judul + nomor */}
        <View style={styles.cardTop}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.judul}
          </Text>
          <View style={styles.nomorPill}>
            <Text style={styles.nomorText}>#{index + 1}</Text>
          </View>
        </View>

        {/* Arab */}
        {item.arab !== "" && (
          <Text style={styles.arabText}>{item.arab}</Text>
        )}

        <View style={styles.cardDivider} />

        {/* Perawi */}
        {item.perawi !== "" && (
          <View style={styles.perawiRow}>
            <Feather name="user" size={11} color={C.secondary} />
            <Text style={styles.perawiText}>{item.perawi}</Text>
          </View>
        )}

        {/* Terjemah */}
        {item.indonesia !== "" && (
          <Text style={styles.indonesiaText} numberOfLines={4}>
            {item.indonesia}
          </Text>
        )}

        {/* Footer: simpan + lihat detail */}
        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={[styles.simpanBtn, isSaved && styles.simpanBtnSaved]}
            onPress={(e) => { e.stopPropagation?.(); toggleSaved(item.key); }}
            activeOpacity={0.8}
          >
            <Feather name="bookmark" size={13} color={isSaved ? C.card : C.secondary} />
            <Text style={[styles.simpanLabel, isSaved && styles.simpanLabelSaved]}>
              {isSaved ? "Tersimpan" : "Simpan"}
            </Text>
          </TouchableOpacity>
          <View style={styles.detailBtn}>
            <Text style={styles.detailBtnText}>Lihat Detail</Text>
            <Feather name="arrow-up-right" size={12} color={C.secondary} />
          </View>
        </View>

      </TouchableOpacity>
    );
  };

  // ── UI ──
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.85)" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Hadits</Text>

        <View style={[styles.iconBtn, { position: "relative" }]}>
          <Feather name="bookmark" size={18} color="rgba(255,255,255,0.7)" />
          {saved.size > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{saved.size}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Feather name="search" size={15} color={C.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari judul hadits..."
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

      {/* Count */}
      {status === "success" && (
        <Text style={styles.countLabel}>
          {filtered.length} Hadits{search ? " ditemukan" : ""}
        </Text>
      )}

      {/* States */}
      {status === "loading" && (
        <View style={styles.stateWrap}>
          <ActivityIndicator size="large" color={C.secondary} />
          <Text style={styles.stateText}>Memuat hadits...</Text>
        </View>
      )}

      {status === "error" && (
        <View style={styles.stateWrap}>
          <Feather name="wifi-off" size={44} color="#c5d5d5" />
          <Text style={styles.stateText}>Gagal memuat data</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => {
              setStatus("loading");
              fetch("https://muslim-api-three.vercel.app/v1/hadits")
                .then((r) => r.json())
                .then((json) => {
                  const raw = extractArray(json);
                  setData(parseHadits(raw));
                  setStatus("success");
                })
                .catch(() => setStatus("error"));
            }}
          >
            <Text style={styles.retryText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      )}

      {status === "success" && filtered.length === 0 && (
        <View style={styles.stateWrap}>
          <Feather name="inbox" size={44} color="#c5d5d5" />
          <Text style={styles.stateText}>Hadits tidak ditemukan</Text>
        </View>
      )}

      {status === "success" && filtered.length > 0 && (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.key}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}

    </SafeAreaView>
  );
}

// ── STYLES ─────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

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
  badge: {
    position: "absolute", top: -5, right: -5,
    minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: C.accent,
    alignItems: "center", justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: { fontSize: 9, fontWeight: "700", color: C.primary },

  // Search
  searchWrap: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
  searchBox: {
    backgroundColor: C.card, borderRadius: 12,
    paddingHorizontal: 13, paddingVertical: 11,
    flexDirection: "row", alignItems: "center", gap: 9,
    borderWidth: 1, borderColor: C.border,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 13, color: C.text, padding: 0 },

  countLabel: {
    fontSize: 12, color: C.muted, fontWeight: "600",
    paddingHorizontal: 20, paddingTop: 6, paddingBottom: 10, letterSpacing: 0.3,
  },

  // States
  stateWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
  stateText: { fontSize: 14, color: C.muted, fontWeight: "500" },
  retryBtn: {
    backgroundColor: C.secondary, paddingHorizontal: 24,
    paddingVertical: 10, borderRadius: 20,
  },
  retryText: { color: "#fff", fontSize: 13, fontWeight: "700" },

  // List
  listContent: { paddingHorizontal: 16, paddingBottom: 32 },

  // Card
  card: {
    backgroundColor: C.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: C.border,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  cardTop: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start", gap: 10, marginBottom: 12,
  },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: "700", color: C.text, lineHeight: 22 },
  nomorPill: {
    backgroundColor: "#e8f5f0", paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 8, flexShrink: 0,
  },
  nomorText: { fontSize: 11, fontWeight: "700", color: C.secondary },

  arabText: {
    fontSize: 20, textAlign: "right", color: C.text,
    lineHeight: 38, fontWeight: "600", marginBottom: 12,
  },
  cardDivider: { height: 1, backgroundColor: C.border, marginBottom: 10 },

  perawiRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 7 },
  perawiText: { fontSize: 12, color: C.secondary, fontWeight: "600", fontStyle: "italic" },

  indonesiaText: {
    fontSize: 13, color: C.text, lineHeight: 21, marginBottom: 14,
  },

  simpanBtn: {
    alignSelf: "flex-end", flexDirection: "row", alignItems: "center",
    gap: 6, paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1.5, borderColor: C.secondary,
  },
  simpanBtnSaved: { backgroundColor: C.secondary, borderColor: C.secondary },
  simpanLabel: { fontSize: 12, fontWeight: "700", color: C.secondary },
  simpanLabelSaved: { color: C.card },
  cardFooter: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginTop: 4,
  },
  detailBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  detailBtnText: { fontSize: 12, color: C.secondary, fontWeight: "700" },
});