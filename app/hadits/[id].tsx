import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

const API = "https://muslim-api-three.vercel.app/v1/hadits";

interface Hadits {
  index:     number;
  judul:     string;
  arab:      string;
  indonesia: string;
}

function str(val: unknown): string {
  if (typeof val === "string") return val.trim();
  if (typeof val === "number") return String(val);
  return "";
}

function extractArray(json: unknown): Record<string, unknown>[] {
  if (Array.isArray(json)) return json;
  if (json && typeof json === "object")
    for (const val of Object.values(json as object))
      if (Array.isArray(val)) return val as Record<string, unknown>[];
  return [];
}

function normalize(raw: Record<string, unknown>, i: number): Hadits {
  return {
    index:     i,
    judul:     str(raw.judul     ?? raw.title ?? raw.name) || `Hadits ${i + 1}`,
    arab:      str(raw.arab      ?? raw.arabic ?? raw.ar),
    indonesia: str(raw.indo ?? raw.terjemah ?? raw.content ?? raw.text),
  };
}

export default function HaditsDetailScreen() {
  const { index: indexParam } = useLocalSearchParams<{ index: string }>();

  const [list, setList]     = useState<Hadits[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [saved, setSaved]   = useState(false);

  const currentIndex = Number(indexParam ?? 0);
  const hadits       = list[currentIndex] ?? null;
  const hasPrev      = currentIndex > 0;
  const hasNext      = currentIndex < list.length - 1;

  const fetchData = () => {
    setStatus("loading");
    fetch(API)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((json) => {
        const raw = extractArray(json);
        if (!raw.length) throw new Error("empty");
        setList(raw.map(normalize));
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { setSaved(false); }, [currentIndex]);

  const navigate = (newIndex: number) => {
    router.replace({ pathname: "/hadits/[id]", params: { index: String(newIndex) } });
  };

  const handleShare = async () => {
    if (!hadits) return;
    const lines: string[] = [
      `✦ ${hadits.judul}`,
      `Hadits #${currentIndex + 1}`,
      "",
    ];
    if (hadits.arab)      lines.push(hadits.arab, "");
    if (hadits.indonesia) lines.push(hadits.indonesia);
    await Share.share({ message: lines.join("\n") });
  };

  // ── LOADING ──
  if (status === "loading") {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <StatusBar barStyle="light-content" backgroundColor={C.primary} />
        <SimpleHeader title="Detail Hadits" />
        <View style={styles.stateWrap}>
          <ActivityIndicator size="large" color={C.secondary} />
          <Text style={styles.stateText}>Memuat hadits...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── ERROR ──
  if (status === "error") {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <StatusBar barStyle="light-content" backgroundColor={C.primary} />
        <SimpleHeader title="Detail Hadits" />
        <View style={styles.stateWrap}>
          <Feather name="wifi-off" size={44} color="#c5d5d5" />
          <Text style={styles.stateText}>Gagal memuat hadits</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchData}>
            <Text style={styles.retryText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!hadits) return null;

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
          <Text style={styles.headerTitle} numberOfLines={1}>{hadits.judul}</Text>
          <Text style={styles.headerSub}>Hadits #{currentIndex + 1} dari {list.length}</Text>
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
        {/* Judul card */}
        <View style={styles.judulCard}>
          <View style={styles.judulIconWrap}>
            <Feather name="book-open" size={22} color={C.accent} />
          </View>
          <Text style={styles.judulText}>{hadits.judul}</Text>
          <View style={styles.nomorPill}>
            <Text style={styles.nomorText}>#{currentIndex + 1}</Text>
          </View>
        </View>

        {/* Arab */}
        {!!hadits.arab && (
          <View style={styles.arabCard}>
            <View style={styles.sectionHead}>
              <View style={[styles.dot, { backgroundColor: C.accent }]} />
              <Text style={[styles.sectionLabel, { color: "rgba(255,255,255,0.5)" }]}>Lafaz Arab</Text>
            </View>
            <Text style={styles.arabText}>{hadits.arab}</Text>
          </View>
        )}

        {/* Terjemah Indonesia */}
        {!!hadits.indonesia && (
          <View style={styles.indoCard}>
            <View style={styles.sectionHead}>
              <View style={[styles.dot, { backgroundColor: "#c9972a" }]} />
              <Text style={styles.sectionLabel}>Terjemah Bahasa Indonesia</Text>
            </View>
            <Text style={styles.indoText}>{hadits.indonesia}</Text>
          </View>
        )}

        {/* Info row */}
        <View style={styles.infoBox}>
          <View style={styles.infoItem}>
            <Feather name="hash" size={15} color={C.secondary} />
            <Text style={styles.infoLabel}>Nomor</Text>
            <Text style={styles.infoValue}>#{currentIndex + 1}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Feather name="layers" size={15} color={C.secondary} />
            <Text style={styles.infoLabel}>Total</Text>
            <Text style={styles.infoValue}>{list.length} hadits</Text>
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

function SimpleHeader({ title }: { title: string }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
        <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.85)" />
      </TouchableOpacity>
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      <View style={styles.iconBtn} />
    </View>
  );
}

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
  headerTitle: { fontSize: 16, color: "#fff", fontWeight: "700" },
  headerSub: { fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 },
  headerRight: { flexDirection: "row", gap: 8 },

  // Judul card
  judulCard: {
    backgroundColor: C.primary, borderRadius: 20,
    padding: 20, alignItems: "center", gap: 12,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25, shadowRadius: 14, elevation: 7,
  },
  judulIconWrap: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: "rgba(226,194,117,0.15)",
    borderWidth: 1, borderColor: "rgba(226,194,117,0.3)",
    alignItems: "center", justifyContent: "center",
  },
  judulText: { fontSize: 17, fontWeight: "700", color: "#fff", textAlign: "center", lineHeight: 26 },
  nomorPill: {
    backgroundColor: "rgba(226,194,117,0.2)",
    paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20,
    borderWidth: 1, borderColor: "rgba(226,194,117,0.35)",
  },
  nomorText: { fontSize: 12, color: C.accent, fontWeight: "700" },

  // Arab
  arabCard: {
    backgroundColor: "#0d3435", borderRadius: 18,
    paddingVertical: 22, paddingHorizontal: 18,
    borderWidth: 1, borderColor: "rgba(226,194,117,0.15)",
  },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  dot: { width: 4, height: 18, borderRadius: 2 },
  sectionLabel: { fontSize: 11, color: C.muted, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.6 },
  arabText: {
    fontSize: 22, color: "#fff", fontWeight: "600",
    textAlign: "right", lineHeight: 44,
  },

  // Indonesia
  indoCard: {
    backgroundColor: C.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: C.border,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  indoText: { fontSize: 15, color: C.text, lineHeight: 28, fontWeight: "500" },

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