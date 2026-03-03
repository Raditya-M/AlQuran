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

interface Doa {
  id: number;
  judul: string;
  arab: string;
  latin: string;
  artinya: string;
}

export default function DoaHarianScreen() {
  const [data, setData] = useState<Doa[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"semua" | "favorit">("semua");
  const [favorits, setFavorits] = useState<number[]>([]);

  useEffect(() => {
    fetch("https://open-api.my.id/api/doa")
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleFavorit = (id: number) => {
    setFavorits((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const filtered = useMemo(() => {
    let list = activeTab === "favorit" ? data.filter((d) => favorits.includes(d.id)) : data;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((d) => {
        const judul = d.judul?.toLowerCase() ?? "";
        const arti = d.artinya?.toLowerCase() ?? "";
        const latin = d.latin?.toLowerCase() ?? "";

        return (
          judul.includes(q) ||
          arti.includes(q) ||
          latin.includes(q)
        );
      });
    }
    return list;
  }, [data, search, activeTab, favorits]);

  const renderItem = ({ item, index }: ListRenderItemInfo<Doa>) => {
    const isFavorit = favorits.includes(item.id);
    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.75} onPress={() => router.push(`/doa/${item.id}`)}>
        {/* Top row */}
        <View style={styles.cardTop}>
          <View style={styles.cardTitleWrap}>
            <Text style={styles.cardTitle}>{item.judul}</Text>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity
              onPress={() => toggleFavorit(item.id)}
              style={styles.favBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather
                name="star"
                size={17}
                color={isFavorit ? C.accent : "#c5d5d5"}
                style={isFavorit ? { opacity: 1 } : { opacity: 0.7 }}
              />
            </TouchableOpacity>
            <View style={styles.nomorBox}>
              <Text style={styles.nomorText}>#{index + 1}</Text>
            </View>
          </View>
        </View>

        {/* Arab */}
        <Text style={styles.arabText}>{item.arab}</Text>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Latin */}
        <Text style={styles.latinText} numberOfLines={2}>{item.latin}</Text>

        {/* Arti */}
        <Text style={styles.artiText} numberOfLines={2}>{item.artinya}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.85)" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doa Harian</Text>
        <TouchableOpacity style={styles.headerAction}>
          <Feather name="rotate-ccw" size={18} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Feather name="search" size={15} color={C.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari judul, arti, latin..."
            placeholderTextColor="#b0c4c4"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={14} color={C.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "semua" && styles.tabActive]}
          onPress={() => setActiveTab("semua")}
        >
          <Text style={[styles.tabText, activeTab === "semua" && styles.tabTextActive]}>
            Semua
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "favorit" && styles.tabActive]}
          onPress={() => setActiveTab("favorit")}
        >
          <Text style={[styles.tabText, activeTab === "favorit" && styles.tabTextActive]}>
            Favorit ({favorits.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.secondary} />
          <Text style={styles.loadingText}>Memuat doa...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Feather name="inbox" size={40} color="#c5d5d5" />
          <Text style={styles.emptyText}>
            {activeTab === "favorit" ? "Belum ada doa favorit" : "Doa tidak ditemukan"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { fontSize: 14, color: C.muted, fontWeight: "500" },
  emptyText: { fontSize: 14, color: C.muted, fontWeight: "500" },

  // Header
  header: {
    backgroundColor: C.primary,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18, color: "#fff", fontWeight: "700", letterSpacing: 0.2,
  },
  headerAction: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center",
  },

  // Search
  searchWrap: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  searchBox: {
    backgroundColor: C.card,
    borderRadius: 12,
    paddingHorizontal: 13, paddingVertical: 11,
    flexDirection: "row", alignItems: "center", gap: 9,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6,
    elevation: 2,
    borderWidth: 1, borderColor: C.border,
  },
  searchInput: { flex: 1, fontSize: 13, color: C.text, padding: 0 },

  // Tabs
  tabsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  tab: {
    paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: C.card,
    borderWidth: 1, borderColor: C.border,
  },
  tabActive: {
    backgroundColor: C.secondary,
    borderColor: C.secondary,
  },
  tabText: { fontSize: 13, color: C.muted, fontWeight: "600" },
  tabTextActive: { color: "#fff" },

  // List
  listContent: { paddingHorizontal: 16, paddingBottom: 32 },

  // Card
  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1, borderColor: C.border,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 6,
    elevation: 2,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardTitleWrap: { flex: 1, paddingRight: 10 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: C.text, lineHeight: 21 },
  cardActions: { flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 0 },
  favBtn: { padding: 2 },
  nomorBox: {
    backgroundColor: "#e8f5f0",
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8,
  },
  nomorText: { fontSize: 11, fontWeight: "700", color: C.secondary },

  arabText: {
    fontSize: 20,
    textAlign: "right",
    color: C.text,
    lineHeight: 38,
    fontWeight: "600",
    marginBottom: 12,
  },

  divider: { height: 1, backgroundColor: C.border, marginBottom: 10 },

  latinText: {
    fontSize: 13,
    fontStyle: "italic",
    color: C.muted,
    lineHeight: 20,
    marginBottom: 6,
  },
  artiText: {
    fontSize: 13,
    color: C.text,
    lineHeight: 20,
    fontWeight: "500",
  },
});