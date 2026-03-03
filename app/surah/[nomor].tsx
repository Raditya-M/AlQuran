import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

interface Ayat {
  id: number;
  nomor: number;
  ar: string;
  tr: string;
  idn: string;
}

interface DetailSurah {
  nama: string;
  nama_latin: string;
  arti: string;
  jumlah_ayat: number;
  tempat_turun: string;
  ayat: Ayat[];
}

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

const cleanHTML = (text: string) => text.replace(/<[^>]*>?/gm, "");

export default function DetailScreen() {
  const { nomor } = useLocalSearchParams();
  const [detail, setDetail] = useState<DetailSurah | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://quran-api.santrikoding.com/api/surah/${nomor}`)
      .then((res) => res.json())
      .then((result) => {
        setDetail(result);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.centerScreen} edges={["top"]}>
        <StatusBar barStyle="light-content" backgroundColor={C.primary} />
        <ActivityIndicator size="large" color={C.secondary} />
        <Text style={styles.loadingText}>Memuat surah...</Text>
      </SafeAreaView>
    );
  }

  if (!detail) {
    return (
      <SafeAreaView style={styles.centerScreen} edges={["top"]}>
        <Feather name="alert-circle" size={40} color={C.muted} />
        <Text style={styles.errorText}>Data tidak ditemukan</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.85)" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{detail.nama_latin}</Text>
          <Text style={styles.headerArab}>{detail.nama}</Text>
        </View>

        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{nomor}</Text>
        </View>
      </View>

      {/* Surah Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoItem}>
          <Feather name="info" size={14} color={C.secondary} />
          <Text style={styles.infoText}>{detail.arti}</Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoItem}>
          <Feather name="map-pin" size={14} color={C.secondary} />
          <Text style={styles.infoText}>
            {detail.tempat_turun === "mekah" ? "Makkiyah" : "Madaniyah"}
          </Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoItem}>
          <Feather name="list" size={14} color={C.secondary} />
          <Text style={styles.infoText}>{detail.jumlah_ayat} Ayat</Text>
        </View>
      </View>

      {/* Bismillah */}
      <View style={styles.bismillahCard}>
        <Text style={styles.bismillahText}>بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</Text>
      </View>

      {/* Ayat List */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {detail.ayat.map((item) => (
          <View key={item.id} style={styles.ayatCard}>
            {/* Nomor Ayat */}
            <View style={styles.ayatHeader}>
              <View style={styles.ayatNomorBox}>
                <Text style={styles.ayatNomor}>{item.nomor}</Text>
              </View>
              <TouchableOpacity style={styles.ayatAction}>
                <Feather name="bookmark" size={15} color={C.muted} />
              </TouchableOpacity>
            </View>

            {/* Arabic */}
            <Text style={styles.arabicText}>{item.ar}</Text>

            {/* Divider */}
            <View style={styles.ayatDivider} />

            {/* Transliterasi */}
            <Text style={styles.trText}>{cleanHTML(item.tr)}</Text>

            {/* Terjemah */}
            <Text style={styles.idnText}>{item.idn}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  centerScreen: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: { fontSize: 14, color: C.muted, fontWeight: "500" },
  errorText: { fontSize: 15, color: C.muted, fontWeight: "600" },

  // Header
  header: {
    backgroundColor: C.primary,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  headerCenter: { flex: 1 },
  headerTitle: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  headerArab: {
    fontSize: 16,
    color: C.accent,
    marginTop: 2,
  },
  headerBadge: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "rgba(226,194,117,0.15)",
    borderWidth: 1,
    borderColor: "rgba(226,194,117,0.3)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  headerBadgeText: {
    fontSize: 13,
    color: C.accent,
    fontWeight: "700",
  },

  // Info Card
  infoCard: {
    backgroundColor: C.card,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: C.border,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    justifyContent: "center",
  },
  infoDivider: {
    width: 1,
    height: 28,
    backgroundColor: C.border,
  },
  infoText: {
    fontSize: 12,
    color: C.text,
    fontWeight: "600",
  },

  // Bismillah
  bismillahCard: {
    backgroundColor: C.primary,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  bismillahText: {
    fontSize: 22,
    color: C.accent,
    textAlign: "center",
    lineHeight: 38,
  },

  // Ayat
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 10,
  },

  ayatCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: C.border,
  },
  ayatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  ayatNomorBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#e8f5f0",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(31,111,92,0.15)",
  },
  ayatNomor: {
    fontSize: 12,
    fontWeight: "700",
    color: C.secondary,
  },
  ayatAction: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
  },

  arabicText: {
    fontSize: 24,
    textAlign: "right",
    color: C.text,
    lineHeight: 44,
    fontWeight: "600",
    marginBottom: 14,
  },

  ayatDivider: {
    height: 1,
    backgroundColor: C.border,
    marginBottom: 10,
  },

  trText: {
    fontSize: 13,
    fontStyle: "italic",
    color: C.muted,
    lineHeight: 22,
    marginBottom: 8,
  },

  idnText: {
    fontSize: 14,
    color: C.text,
    lineHeight: 24,
    fontWeight: "500",
  },
});