import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Share,
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

interface DoaDetail {
  id: number;
  judul: string;
  arab: string;
  latin: string;
  artinya: string;
}

export default function DoaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [doa, setDoa]       = useState<DoaDetail | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [favorit, setFavorit] = useState(false);

  const fetchDoa = () => {
    if (!id) return;
    setStatus("loading");
    fetch(`https://open-api.my.id/api/doa/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then((json) => {
        // Normalize: API bisa pakai field yang berbeda-beda
        const raw: Record<string, unknown> =
          json?.id || json?.judul ? json : json?.data ?? json;
        const s = (v: unknown) => (typeof v === "string" ? v.trim() : "");
        setDoa({
          id:      Number(raw.id ?? raw._id ?? id),
          judul:   s(raw.judul   ?? raw.nama   ?? raw.title) || `Doa ${id}`,
          arab:    s(raw.arab    ?? raw.arabic  ?? raw.ar),
          latin:   s(raw.latin   ?? raw.transliterasi ?? raw.transliteration),
          artinya: s(raw.artinya ?? raw.arti    ?? raw.terjemah ?? raw.translation ?? raw.meaning),
        });
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(() => { fetchDoa(); }, [id]);

  const handleShare = async () => {
    if (!doa) return;
    await Share.share({
      message: `${doa.judul}\n\n${doa.arab}\n\n${doa.latin}\n\nArtinya: ${doa.artinya}`,
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.85)" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {status === "success" && doa ? doa.judul : "Detail Doa"}
        </Text>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setFavorit((p) => !p)}>
            <Feather
              name="star"
              size={18}
              color={favorit ? C.accent : "rgba(255,255,255,0.7)"}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
            <Feather name="share-2" size={18} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Loading */}
      {status === "loading" && (
        <View style={styles.stateWrap}>
          <ActivityIndicator size="large" color={C.secondary} />
          <Text style={styles.stateText}>Memuat doa...</Text>
        </View>
      )}

      {/* Error */}
      {status === "error" && (
        <View style={styles.stateWrap}>
          <Feather name="alert-circle" size={44} color="#c5d5d5" />
          <Text style={styles.stateText}>Gagal memuat doa</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={fetchDoa}
          >
            <Text style={styles.retryText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      {status === "success" && doa && (
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
            <Text style={styles.judulText}>{doa.judul}</Text>
            <View style={styles.nomorPill}>
              <Text style={styles.nomorText}>#{doa.id}</Text>
            </View>
          </View>

          {/* Arab */}
          <View style={styles.arabCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionLabel}>Lafaz Arab</Text>
            </View>
            <Text style={styles.arabText}>{doa.arab}</Text>
          </View>

          {/* Latin */}
          <View style={styles.contentCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: "#c9972a" }]} />
              <Text style={styles.sectionLabel}>Transliterasi</Text>
            </View>
            <Text style={styles.latinText}>{doa.latin}</Text>
          </View>

          {/* Arti */}
          <View style={styles.contentCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: "#3a5aad" }]} />
              <Text style={styles.sectionLabel}>Artinya</Text>
            </View>
            <Text style={styles.artiText}>{doa.artinya}</Text>
          </View>

          {/* Action buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, favorit && styles.actionBtnActive]}
              onPress={() => setFavorit((p) => !p)}
              activeOpacity={0.8}
            >
              <Feather name="star" size={16} color={favorit ? C.card : C.secondary} />
              <Text style={[styles.actionText, favorit && styles.actionTextActive]}>
                {favorit ? "Difavoritkan" : "Tambah Favorit"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <Feather name="share-2" size={16} color={C.secondary} />
              <Text style={styles.actionText}>Bagikan</Text>
            </TouchableOpacity>
          </View>

          {/* Navigasi doa */}
          <View style={styles.navRow}>
            <TouchableOpacity
              style={[styles.navBtn, Number(id) <= 1 && styles.navBtnDisabled]}
              onPress={() => router.replace(`/doa/${Number(id) - 1}`)}
              disabled={Number(id) <= 1}
              activeOpacity={0.75}
            >
              <Feather name="chevron-left" size={18} color={Number(id) <= 1 ? "#c5d5d5" : C.secondary} />
              <Text style={[styles.navText, Number(id) <= 1 && styles.navTextDisabled]}>
                Doa Sebelumnya
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => router.replace(`/doa/${Number(id) + 1}`)}
              activeOpacity={0.75}
            >
              <Text style={styles.navText}>Doa Berikutnya</Text>
              <Feather name="chevron-right" size={18} color={C.secondary} />
            </TouchableOpacity>
          </View>

        </ScrollView>
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
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  headerTitle: {
    flex: 1, fontSize: 17, color: "#fff",
    fontWeight: "700", letterSpacing: 0.2,
  },
  headerRight: { flexDirection: "row", gap: 8 },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 40 },

  // Judul card
  judulCard: {
    backgroundColor: C.primary,
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    gap: 12,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25, shadowRadius: 14, elevation: 7,
  },
  judulIconWrap: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: "rgba(226,194,117,0.15)",
    borderWidth: 1, borderColor: "rgba(226,194,117,0.3)",
    alignItems: "center", justifyContent: "center",
  },
  judulText: {
    fontSize: 18, fontWeight: "700", color: "#fff",
    textAlign: "center", lineHeight: 26,
  },
  nomorPill: {
    backgroundColor: "rgba(226,194,117,0.2)",
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1,
    borderColor: "rgba(226,194,117,0.35)",
  },
  nomorText: { fontSize: 12, color: C.accent, fontWeight: "700" },

  // Arab card
  arabCard: {
    backgroundColor: C.card,
    borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: C.border,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  arabText: {
    fontSize: 26,
    textAlign: "right",
    color: C.text,
    lineHeight: 48,
    fontWeight: "600",
    marginTop: 10,
  },

  // Content card
  contentCard: {
    backgroundColor: C.card,
    borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: C.border,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },

  sectionHeader: {
    flexDirection: "row", alignItems: "center",
    gap: 8, marginBottom: 10,
  },
  sectionDot: {
    width: 4, height: 18, borderRadius: 2,
    backgroundColor: C.secondary,
  },
  sectionLabel: {
    fontSize: 12, color: C.muted,
    fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.6,
  },

  latinText: {
    fontSize: 14, color: C.text,
    lineHeight: 24, fontStyle: "italic",
  },
  artiText: {
    fontSize: 15, color: C.text,
    lineHeight: 26, fontWeight: "500",
  },

  // Actions
  actions: {
    flexDirection: "row", gap: 10,
  },
  actionBtn: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8,
    paddingVertical: 13, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.secondary,
    backgroundColor: "transparent",
  },
  actionBtnActive: {
    backgroundColor: C.secondary, borderColor: C.secondary,
  },
  actionText: { fontSize: 13, fontWeight: "700", color: C.secondary },
  actionTextActive: { color: C.card },

  // Nav prev/next
  navRow: {
    flexDirection: "row", justifyContent: "space-between",
    backgroundColor: C.card, borderRadius: 14,
    paddingVertical: 12, paddingHorizontal: 16,
    borderWidth: 1, borderColor: C.border,
  },
  navBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
  },
  navBtnDisabled: { opacity: 0.35 },
  navText: { fontSize: 13, color: C.secondary, fontWeight: "700" },
  navTextDisabled: { color: "#c5d5d5" },
});