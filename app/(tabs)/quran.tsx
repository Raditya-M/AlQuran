import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ListRenderItemInfo,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

interface Surah {
  nomor: number;
  nama_latin: string;
  nama: string;
  jumlah_ayat: number;
  tempat_turun: string;
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

export default function HomeScreen() {
  const [data, setData] = useState<Surah[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("https://quran-api.santrikoding.com/api/surah")
      .then((res) => res.json())
      .then((result) => setData(result))
      .catch((err) => console.log(err));
  }, []);

  const filtered = data.filter(
    (s) =>
      s.nama_latin.toLowerCase().includes(search.toLowerCase()) ||
      s.nomor.toString().includes(search)
  );

  const renderItem = ({ item }: ListRenderItemInfo<Surah>) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/surah/${item.nomor}`)}
      activeOpacity={0.75}
    >
      {/* Nomor */}
      <View style={styles.nomorBox}>
        <Text style={styles.nomorText}>{item.nomor}</Text>
      </View>

      {/* Info */}
      <View style={styles.cardInfo}>
        <Text style={styles.namaLatin}>{item.nama_latin}</Text>
        <Text style={styles.cardMeta}>
          {item.tempat_turun === "mekah" ? "Makkiyah" : "Madaniyah"} •{" "}
          {item.jumlah_ayat} Ayat
        </Text>
      </View>

      {/* Arab + Arrow */}
      <View style={styles.cardRight}>
        <Text style={styles.namaArab}>{item.nama}</Text>
        <Feather name="chevron-right" size={16} color={C.muted} style={{ marginTop: 4 }} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>Baca & Pahami</Text>
          <Text style={styles.headerTitle}>Al-Qur'an</Text>
        </View>
        <View style={styles.headerIcon}>
          <Feather name="book-open" size={22} color={C.accent} />
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color={C.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama surah..."
            placeholderTextColor="#b0c4c4"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={15} color={C.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Count */}
      <Text style={styles.countLabel}>
        {filtered.length} Surah
      </Text>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.nomor.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  header: {
    backgroundColor: C.primary,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
    fontWeight: "500",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  headerTitle: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "700",
    marginTop: 2,
    letterSpacing: 0.3,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(226,194,117,0.15)",
    borderWidth: 1,
    borderColor: "rgba(226,194,117,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },

  searchWrap: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  searchBox: {
    backgroundColor: C.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: { flex: 1, fontSize: 13, color: C.text, padding: 0 },

  countLabel: {
    fontSize: 12,
    color: C.muted,
    fontWeight: "600",
    paddingHorizontal: 20,
    paddingBottom: 8,
    letterSpacing: 0.3,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  separator: { height: 8 },

  card: {
    backgroundColor: C.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: C.border,
  },

  nomorBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#e8f5f0",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  nomorText: {
    fontSize: 13,
    fontWeight: "700",
    color: C.secondary,
  },

  cardInfo: { flex: 1 },
  namaLatin: {
    fontSize: 15,
    fontWeight: "700",
    color: C.text,
    marginBottom: 3,
  },
  cardMeta: {
    fontSize: 12,
    color: C.muted,
    fontWeight: "500",
  },

  cardRight: { alignItems: "flex-end" },
  namaArab: {
    fontSize: 18,
    color: C.secondary,
    fontWeight: "600",
  },
});