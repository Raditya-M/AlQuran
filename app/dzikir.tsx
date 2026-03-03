import { useEffect, useState, useMemo } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, StatusBar, ActivityIndicator,
  ListRenderItemInfo,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

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

type Waktu = "Semua" | "Pagi" | "Sore" | "Solat";
type Jenis = "harian" | "duha";

export interface Dzikir {
  key:     string;
  index:   number;
  waktu:   string;
  arab:    string;
  latin:   string;
  arti:    string;
  faedah:  string;
  ulangan: number;
  sumber:  string;
}

// ── HELPERS ───────────────────────────────────────────
function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function extractArray(json: unknown): Record<string, unknown>[] {
  if (Array.isArray(json)) return json;
  if (json && typeof json === "object")
    for (const val of Object.values(json as object))
      if (Array.isArray(val)) return val as Record<string, unknown>[];
  return [];
}

function normalizeDzikir(raw: Record<string, unknown>, i: number, total: number): Dzikir {
  const waktuRaw = str(raw.waktu ?? raw.time ?? raw.type ?? raw.kategori ?? "").toLowerCase();
  let waktu = "Pagi";
  if (waktuRaw.includes("sore") || waktuRaw.includes("petang")) waktu = "Sore";
  else if (waktuRaw.includes("solat") || waktuRaw.includes("shalat") || waktuRaw.includes("salat")) waktu = "Solat";
  else if (!waktuRaw) {
    // Auto distribusi kalau tidak ada field waktu
    if (i < Math.floor(total * 0.45)) waktu = "Pagi";
    else if (i < Math.floor(total * 0.8)) waktu = "Sore";
    else waktu = "Solat";
  }

  return {
    key:     String(raw.id ?? raw._id ?? i),
    index:   i,
    waktu,
    arab:    str(raw.arab    ?? raw.arabic ?? raw.ar ?? raw.lafadz),
    latin:   str(raw.latin   ?? raw.transliterasi ?? raw.transliteration),
    arti:    str(raw.arti    ?? raw.artinya ?? raw.terjemah ?? raw.translation ?? raw.meaning),
    faedah:  str(raw.faedah  ?? raw.keutamaan ?? raw.benefit ?? raw.description ?? raw.deskripsi),
    ulangan: Number(raw.ulangan ?? raw.count ?? raw.repeat ?? 1) || 1,
    sumber:  str(raw.sumber  ?? raw.source ?? raw.referensi ?? raw.ref),
  };
}

export function waktuColor(w: string): { bg: string; text: string } {
  if (w === "Sore")  return { bg: "#e8edf8", text: "#3a5aad" };
  if (w === "Solat") return { bg: "#e8f5f0", text: C.secondary };
  return { bg: "#fdf3dc", text: "#b07d1a" };
}

// ── SCREEN ────────────────────────────────────────────
export default function DzikirScreen() {
  const [dataHarian, setDataHarian] = useState<Dzikir[]>([]);
  const [dataDuha, setDataDuha]     = useState<Dzikir[]>([]);
  const [statusHarian, setStatusHarian] = useState<"loading"|"success"|"error">("loading");
  const [statusDuha, setStatusDuha]     = useState<"idle"|"loading"|"success"|"error">("idle");
  const [jenisTab, setJenisTab]     = useState<Jenis>("harian");
  const [waktuTab, setWaktuTab]     = useState<Waktu>("Semua");
  const [savedCount, setSavedCount] = useState(0);

  // Fetch harian
  const loadHarian = () => {
    setStatusHarian("loading");
    fetch("https://muslim-api-three.vercel.app/v1/dzikir")
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((json) => {
        const raw = extractArray(json);
        if (!raw.length) throw new Error("empty");
        setDataHarian(raw.map((item, i) => normalizeDzikir(item, i, raw.length)));
        setStatusHarian("success");
      })
      .catch(() => setStatusHarian("error"));
  };

  // Fetch duha
  const loadDuha = () => {
    if (statusDuha === "loading") return;
    setStatusDuha("loading");
    fetch("https://muslim-api-three.vercel.app/v1/dzikir/duha")
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((json) => {
        const raw = extractArray(json);
        if (!raw.length) throw new Error("empty");
        setDataDuha(raw.map((item, i) => normalizeDzikir(item, i, raw.length)));
        setStatusDuha("success");
      })
      .catch(() => {
        // Fallback: pakai slice dari harian
        if (dataHarian.length > 0) {
          setDataDuha(
            dataHarian.slice(0, Math.min(10, dataHarian.length))
              .map((d, i) => ({ ...d, key: `duha-${i}`, waktu: "Pagi" }))
          );
          setStatusDuha("success");
        } else {
          setStatusDuha("error");
        }
      });
  };

  useEffect(() => { loadHarian(); }, []);

  const currentData   = jenisTab === "harian" ? dataHarian : dataDuha;
  const currentStatus = jenisTab === "harian" ? statusHarian : statusDuha;

  const filtered = useMemo(() => {
    if (waktuTab === "Semua") return currentData;
    return currentData.filter((d) => d.waktu === waktuTab);
  }, [currentData, waktuTab]);

  const navigateToDetail = (item: Dzikir) => {
    // Pass data via query params (encoded)
    router.push({
      pathname: "/dzikir/[id]",
      params: {
        key:     item.key,
        index:   String(item.index),
        waktu:   item.waktu,
        arab:    item.arab,
        latin:   item.latin,
        arti:    item.arti,
        faedah:  item.faedah,
        ulangan: String(item.ulangan),
        sumber:  item.sumber,
      },
    });
  };

  const renderItem = ({ item, index }: ListRenderItemInfo<Dzikir>) => {
    const wc = waktuColor(item.waktu);
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => navigateToDetail(item)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardMeta}>
            <Text style={styles.cardIndex}>Dzikir #{index + 1}</Text>
            <View style={[styles.waktuPill, { backgroundColor: wc.bg }]}>
              <Text style={[styles.waktuPillText, { color: wc.text }]}>{item.waktu}</Text>
            </View>
          </View>
          <Feather name="chevron-right" size={16} color="#c5d5d5" />
        </View>

        <Text style={styles.cardArab} numberOfLines={4}>{item.arab}</Text>

        {item.ulangan > 1 && (
          <View style={styles.ulanganRow}>
            <Feather name="repeat" size={11} color={C.secondary} />
            <Text style={styles.ulanganText}>{item.ulangan}x</Text>
          </View>
        )}

        <View style={styles.cardFooter}>
          <Text style={styles.cardSumber} numberOfLines={1}>
            {item.sumber ? `📚 ${item.sumber}` : ""}
          </Text>
          <View style={styles.detailBtn}>
            <Text style={styles.detailBtnText}>Lihat Detail</Text>
            <Feather name="arrow-up-right" size={12} color={C.secondary} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.85)" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dzikir</Text>
        <View style={styles.iconBtn}>
          <Feather name="bookmark" size={18} color="rgba(255,255,255,0.7)" />
        </View>
      </View>

      {/* Jenis tabs */}
      <View style={styles.jenisTabs}>
        {(["harian", "duha"] as Jenis[]).map((j) => (
          <TouchableOpacity
            key={j}
            style={[styles.jenisTab, jenisTab === j && styles.jenisTabActive]}
            onPress={() => {
              setJenisTab(j);
              setWaktuTab("Semua");
              if (j === "duha" && statusDuha === "idle") loadDuha();
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.jenisTabText, jenisTab === j && styles.jenisTabTextActive]}>
              {j === "harian" ? "Dzikir Harian" : "Dzikir Duha"}
            </Text>
            {j === "duha" && (
              <View style={styles.developBadge}>
                <Text style={styles.developText}>DEVELOP</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Waktu filter */}
      <View style={styles.waktuRow}>
        {(["Semua", "Pagi", "Sore", "Solat"] as Waktu[]).map((w) => (
          <TouchableOpacity
            key={w}
            style={[styles.waktuTab, waktuTab === w && styles.waktuTabActive]}
            onPress={() => setWaktuTab(w)}
            activeOpacity={0.75}
          >
            <Text style={[styles.waktuTabText, waktuTab === w && styles.waktuTabTextActive]}>{w}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* States */}
      {(currentStatus === "loading" || currentStatus === "idle") && (
        <View style={styles.stateWrap}>
          <ActivityIndicator size="large" color={C.secondary} />
          <Text style={styles.stateText}>Memuat dzikir...</Text>
        </View>
      )}

      {currentStatus === "error" && (
        <View style={styles.stateWrap}>
          <Feather name="wifi-off" size={44} color="#c5d5d5" />
          <Text style={styles.stateText}>Gagal memuat data</Text>
          <TouchableOpacity style={styles.retryBtn}
            onPress={() => jenisTab === "harian" ? loadHarian() : loadDuha()}>
            <Text style={styles.retryText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      )}

      {currentStatus === "success" && filtered.length === 0 && (
        <View style={styles.stateWrap}>
          <Feather name="inbox" size={44} color="#c5d5d5" />
          <Text style={styles.stateText}>Tidak ada dzikir di waktu ini</Text>
        </View>
      )}

      {currentStatus === "success" && filtered.length > 0 && (
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  stateWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
  stateText: { fontSize: 14, color: C.muted, fontWeight: "500" },
  retryBtn: { backgroundColor: C.secondary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  retryText: { color: "#fff", fontSize: 13, fontWeight: "700" },

  header: {
    backgroundColor: C.primary,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  iconBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 18, color: "#fff", fontWeight: "700" },

  jenisTabs: {
    flexDirection: "row", backgroundColor: C.card,
    borderBottomWidth: 1, borderBottomColor: C.border,
    paddingHorizontal: 16, paddingTop: 4,
  },
  jenisTab: {
    flex: 1, paddingVertical: 12, alignItems: "center",
    flexDirection: "row", justifyContent: "center", gap: 6,
    borderBottomWidth: 2.5, borderBottomColor: "transparent",
  },
  jenisTabActive: { borderBottomColor: C.secondary },
  jenisTabText: { fontSize: 14, color: C.muted, fontWeight: "600" },
  jenisTabTextActive: { color: C.secondary },
  developBadge: { backgroundColor: "#fdf3dc", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
  developText: { fontSize: 9, fontWeight: "700", color: "#b07d1a", letterSpacing: 0.4 },

  waktuRow: {
    flexDirection: "row", gap: 8,
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.card,
  },
  waktuTab: {
    flex: 1, paddingVertical: 7, alignItems: "center",
    borderRadius: 10, backgroundColor: C.bg,
    borderWidth: 1, borderColor: C.border,
  },
  waktuTabActive: { backgroundColor: C.secondary, borderColor: C.secondary },
  waktuTabText: { fontSize: 12, color: C.muted, fontWeight: "600" },
  waktuTabTextActive: { color: "#fff" },

  listContent: { padding: 16, paddingBottom: 40 },

  card: {
    backgroundColor: C.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: C.border,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  cardHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 12,
  },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardIndex: { fontSize: 12, color: C.muted, fontWeight: "600" },
  waktuPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  waktuPillText: { fontSize: 11, fontWeight: "700" },
  cardArab: {
    fontSize: 22, textAlign: "right", color: C.text,
    lineHeight: 40, fontWeight: "600", marginBottom: 10,
  },
  ulanganRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 10 },
  ulanganText: { fontSize: 12, color: C.secondary, fontWeight: "700" },
  cardFooter: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginTop: 4,
  },
  cardSumber: { fontSize: 11, color: C.muted, flex: 1 },
  detailBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  detailBtnText: { fontSize: 12, color: C.secondary, fontWeight: "700" },
});