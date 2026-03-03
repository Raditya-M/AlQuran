import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Share,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

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

const API = "https://muslim-api-three.vercel.app/v1/dzikir";

interface DzikirRaw {
  type?:  string;
  arab?:  string;
  indo?:  string;
  ulang?: string;
  [key: string]: unknown;
}

interface Dzikir {
  index:  number;
  type:   string;
  arab:   string;
  indo:   string;
  ulang:  string;
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function parseUlang(v: unknown): string {
  const s = String(v ?? "1").trim();
  // pastikan ada huruf "x"
  return /x$/i.test(s) ? s : `${s}x`;
}

function extractArray(json: unknown): DzikirRaw[] {
  if (Array.isArray(json)) return json;
  if (json && typeof json === "object")
    for (const val of Object.values(json as object))
      if (Array.isArray(val)) return val as DzikirRaw[];
  return [];
}

function normalize(raw: DzikirRaw, i: number): Dzikir {
  return {
    index: i,
    type:  str(raw.type  ?? raw.waktu ?? raw.kategori ?? "Pagi"),
    arab:  str(raw.arab  ?? raw.arabic ?? raw.lafadz),
    indo:  str(raw.indo  ?? raw.arti   ?? raw.artinya ?? raw.terjemah),
    ulang: parseUlang(raw.ulang ?? raw.ulangan ?? raw.count ?? "1"),
  };
}

function typeColor(t: string): { bg: string; text: string } {
  const tl = t.toLowerCase();
  if (tl.includes("sore") || tl.includes("petang")) return { bg: "#e8edf8", text: "#3a5aad" };
  if (tl.includes("solat") || tl.includes("shalat")) return { bg: "#e8f5f0", text: C.secondary };
  return { bg: "#fdf3dc", text: "#b07d1a" };
}

// ── SCREEN ────────────────────────────────────────────
export default function DzikirDetailScreen() {
  const { index: indexParam } = useLocalSearchParams<{ index: string }>();

  const [list, setList]     = useState<Dzikir[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [saved, setSaved]   = useState(false);

  const currentIndex = Number(indexParam ?? 0);
  const dzikir       = list[currentIndex] ?? null;
  const hasPrev      = currentIndex > 0;
  const hasNext      = currentIndex < list.length - 1;

  useEffect(() => {
    fetch(API)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((json) => {
        const raw = extractArray(json);
        if (!raw.length) throw new Error("empty");
        setList(raw.map(normalize));
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, []);

  // Reset saved saat pindah dzikir
  useEffect(() => { setSaved(false); }, [currentIndex]);

  const navigate = (newIndex: number) => {
    router.replace({ pathname: "/dzikir/[id]", params: { index: String(newIndex) } });
  };

  const handleShare = async () => {
    if (!dzikir) return;
    const lines = [
      `✦ Dzikir #${currentIndex + 1} — ${dzikir.type}`,
      "",
      dzikir.arab,
      "",
      `Artinya:`,
      dzikir.indo,
      "",
      `Dibaca: ${dzikir.ulang}`,
    ];
    await Share.share({ message: lines.join("\n") });
  };

  // ── LOADING ──
  if (status === "loading") {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <StatusBar barStyle="light-content" backgroundColor={C.primary} />
        <Header onBack={() => router.back()} title="Detail Dzikir" />
        <View style={styles.stateWrap}>
          <ActivityIndicator size="large" color={C.secondary} />
          <Text style={styles.stateText}>Memuat dzikir...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── ERROR ──
  if (status === "error") {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <StatusBar barStyle="light-content" backgroundColor={C.primary} />
        <Header onBack={() => router.back()} title="Detail Dzikir" />
        <View style={styles.stateWrap}>
          <Feather name="wifi-off" size={44} color="#c5d5d5" />
          <Text style={styles.stateText}>Gagal memuat data</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => {
              setStatus("loading");
              fetch(API).then(r => r.json())
                .then(json => { setList(extractArray(json).map(normalize)); setStatus("success"); })
                .catch(() => setStatus("error"));
            }}
          >
            <Text style={styles.retryText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!dzikir) return null;

  const tc = typeColor(dzikir.type);

  // ── CONTENT ──
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.85)" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Dzikir #{currentIndex + 1}</Text>
          <Text style={styles.headerSub}>{list.length} dzikir tersedia</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setSaved(p => !p)}>
            <Feather name="bookmark" size={18} color={saved ? C.accent : "rgba(255,255,255,0.7)"} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
            <Feather name="share-2" size={18} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Badges: type + ulang */}
        <View style={styles.badgeRow}>
          <View style={[styles.typePill, { backgroundColor: tc.bg }]}>
            <Feather name="clock" size={11} color={tc.text} />
            <Text style={[styles.typePillText, { color: tc.text }]}>{dzikir.type}</Text>
          </View>
          <View style={styles.ulangPill}>
            <Feather name="repeat" size={11} color={C.secondary} />
            <Text style={styles.ulangPillText}>{dzikir.ulang}</Text>
          </View>
        </View>

        {/* Arab */}
        <View style={styles.arabCard}>
          <View style={styles.arabCardLabel}>
            <View style={styles.arabDot} />
            <Text style={styles.arabCardLabelText}>Lafaz Arab</Text>
          </View>
          <Text style={styles.arabText}>{dzikir.arab}</Text>
        </View>

        {/* Terjemah Indonesia */}
        <View style={styles.indoCard}>
          <View style={styles.sectionHead}>
            <View style={[styles.dot, { backgroundColor: "#c9972a" }]} />
            <Text style={styles.sectionLabel}>Terjemah Bahasa Indonesia</Text>
          </View>
          <Text style={styles.indoText}>{dzikir.indo}</Text>
        </View>

        {/* Info box */}
        <View style={styles.infoBox}>
          <View style={styles.infoItem}>
            <Feather name="clock" size={15} color={C.secondary} />
            <Text style={styles.infoLabel}>Waktu</Text>
            <Text style={styles.infoValue}>{dzikir.type}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Feather name="repeat" size={15} color={C.secondary} />
            <Text style={styles.infoLabel}>Dibaca</Text>
            <Text style={styles.infoValue}>{dzikir.ulang}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Feather name="hash" size={15} color={C.secondary} />
            <Text style={styles.infoLabel}>Urutan</Text>
            <Text style={styles.infoValue}>#{currentIndex + 1} / {list.length}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, saved && styles.actionBtnActive]}
            onPress={() => setSaved(p => !p)}
            activeOpacity={0.8}
          >
            <Feather name="bookmark" size={16} color={saved ? C.card : C.secondary} />
            <Text style={[styles.actionText, saved && styles.actionTextActive]}>
              {saved ? "Tersimpan" : "Simpan"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleShare} activeOpacity={0.8}>
            <Feather name="share-2" size={16} color={C.secondary} />
            <Text style={styles.actionText}>Bagikan</Text>
          </TouchableOpacity>
        </View>

        {/* Navigasi */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, !hasPrev && styles.navBtnDisabled]}
            disabled={!hasPrev}
            onPress={() => navigate(currentIndex - 1)}
            activeOpacity={0.75}
          >
            <Feather name="chevron-left" size={18} color={hasPrev ? C.secondary : "#c5d5d5"} />
            <Text style={[styles.navText, !hasPrev && styles.navTextDisabled]}>Sebelumnya</Text>
          </TouchableOpacity>

          <Text style={styles.navCounter}>{currentIndex + 1} / {list.length}</Text>

          <TouchableOpacity
            style={[styles.navBtn, !hasNext && styles.navBtnDisabled]}
            disabled={!hasNext}
            onPress={() => navigate(currentIndex + 1)}
            activeOpacity={0.75}
          >
            <Text style={[styles.navText, !hasNext && styles.navTextDisabled]}>Berikutnya</Text>
            <Feather name="chevron-right" size={18} color={hasNext ? C.secondary : "#c5d5d5"} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ── REUSABLE HEADER ───────────────────────────────────
function Header({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.iconBtn} onPress={onBack}>
        <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.85)" />
      </TouchableOpacity>
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      <View style={styles.iconBtn} />
    </View>
  );
}

// ── STYLES ────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 48 },

  stateWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
  stateText: { fontSize: 14, color: C.muted, fontWeight: "500" },
  retryBtn: { backgroundColor: C.secondary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  retryText: { color: "#fff", fontSize: 13, fontWeight: "700" },

  // Header
  header: {
    backgroundColor: C.primary,
    paddingHorizontal: 14, paddingTop: 12, paddingBottom: 16,
    flexDirection: "row", alignItems: "center", gap: 10,
  },
  iconBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 17, color: "#fff", fontWeight: "700" },
  headerSub: { fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 1 },
  headerRight: { flexDirection: "row", gap: 8 },

  // Badges
  badgeRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  typePill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  typePillText: { fontSize: 12, fontWeight: "700" },
  ulangPill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#e8f5f0", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  ulangPillText: { fontSize: 12, fontWeight: "700", color: C.secondary },

  // Arab card
  arabCard: {
    backgroundColor: C.primary, borderRadius: 20,
    paddingVertical: 24, paddingHorizontal: 20,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25, shadowRadius: 14, elevation: 7,
  },
  arabCardLabel: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  arabDot: { width: 4, height: 16, borderRadius: 2, backgroundColor: C.accent },
  arabCardLabelText: { fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.6 },
  arabText: {
    fontSize: 26, color: "#fff", fontWeight: "700",
    textAlign: "right", lineHeight: 48,
  },

  // Indo card
  indoCard: {
    backgroundColor: C.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: C.border,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  dot: { width: 4, height: 18, borderRadius: 2 },
  sectionLabel: { fontSize: 11, color: C.muted, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.6 },
  indoText: { fontSize: 16, color: C.text, lineHeight: 28, fontWeight: "500" },

  // Info box
  infoBox: {
    flexDirection: "row", backgroundColor: C.card,
    borderRadius: 16, paddingVertical: 14, paddingHorizontal: 8,
    borderWidth: 1, borderColor: C.border,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  infoItem: { flex: 1, alignItems: "center", gap: 5 },
  infoDivider: { width: 1, backgroundColor: C.border },
  infoLabel: { fontSize: 10, color: C.muted, fontWeight: "600" },
  infoValue: { fontSize: 12, color: C.text, fontWeight: "700", textAlign: "center" },

  // Actions
  actions: { flexDirection: "row", gap: 10 },
  actionBtn: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8, paddingVertical: 14,
    borderRadius: 14, borderWidth: 1.5, borderColor: C.secondary,
  },
  actionBtnActive: { backgroundColor: C.secondary, borderColor: C.secondary },
  actionText: { fontSize: 13, fontWeight: "700", color: C.secondary },
  actionTextActive: { color: C.card },

  // Nav
  navRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: C.card, borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 16,
    borderWidth: 1, borderColor: C.border,
  },
  navBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  navBtnDisabled: { opacity: 0.3 },
  navText: { fontSize: 13, color: C.secondary, fontWeight: "700" },
  navTextDisabled: { color: "#c5d5d5" },
  navCounter: { fontSize: 12, color: C.muted, fontWeight: "600" },
});