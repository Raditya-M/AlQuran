import { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  ActivityIndicator,
  ListRenderItemInfo,
  ScrollView,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

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

const CATEGORIES = ["Semua", "Islam", "Ramadhan", "Ibadah", "Kisah Nabi", "Tafsir"];

const RSS_URL =
  "https://api.rss2json.com/v1/api.json?rss_url=https://republika.co.id/rss/khazanah";

// RSS2JSON bisa return gambar di berbagai field
interface RSSItem {
  title:       string;
  link:        string;
  pubDate:     string;
  author:      string;
  thumbnail:   string;       // field utama gambar di rss2json
  description: string;       // HTML — bisa mengandung <img>
  content:     string;       // full HTML content
  categories:  string[];
  enclosure:   { link?: string; url?: string; type?: string } | null;
  [key: string]: unknown;
}

interface Artikel {
  id:        string;
  judul:     string;
  link:      string;
  tanggal:   string;
  penulis:   string;
  gambar:    string;
  ringkasan: string;
  kategori:  string;
}

// ── HELPERS ────────────────────────────────────────────

function stripHTML(str: string): string {
  return (str ?? "").replace(/<[^>]*>/g, "").replace(/&[a-z]+;/gi, " ").trim();
}

function formatDate(pubDate: string): string {
  try {
    return new Date(pubDate).toLocaleDateString("id-ID", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch {
    return pubDate;
  }
}

// Cari gambar dari semua kemungkinan field RSS2JSON
function extractImage(item: RSSItem): string {
  // 1. Field thumbnail langsung
  if (item.thumbnail?.startsWith("http")) return item.thumbnail;

  // 2. Enclosure (media attachment)
  const enc = item.enclosure;
  if (enc?.link?.startsWith("http")) return enc.link;
  if (enc?.url?.startsWith("http"))  return enc.url;

  // 3. Cari <img src="..."> di content (lebih lengkap dari description)
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/i;
  const fromContent = item.content?.match(imgRegex);
  if (fromContent?.[1]?.startsWith("http")) return fromContent[1];

  // 4. Cari di description
  const fromDesc = item.description?.match(imgRegex);
  if (fromDesc?.[1]?.startsWith("http")) return fromDesc[1];

  // 5. Fallback placeholder
  return "https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=600&q=80";
}

function guessCategory(item: RSSItem): string {
  const text = (item.title + " " + item.description).toLowerCase();
  if (text.includes("ramadhan") || text.includes("puasa") || text.includes("sahur"))
    return "Ramadhan";
  if (text.includes("shalat") || text.includes("zakat") || text.includes("haji") || text.includes("umrah") || text.includes("ibadah"))
    return "Ibadah";
  if (text.includes("nabi") || text.includes("rasul") || text.includes("sahabat"))
    return "Kisah Nabi";
  if (text.includes("tafsir") || text.includes("ayat") || text.includes("quran") || text.includes("surah"))
    return "Tafsir";
  return "Islam";
}

function parseRSS(items: RSSItem[]): Artikel[] {
  return items.map((item, i) => ({
    id:        String(i),
    judul:     stripHTML(item.title),
    link:      item.link,
    tanggal:   formatDate(item.pubDate),
    penulis:   item.author || "Redaksi",
    gambar:    extractImage(item),
    ringkasan: stripHTML(item.description).slice(0, 160),
    kategori:  item.categories?.length > 0 ? item.categories[0] : guessCategory(item),
  }));
}

const BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  Islam:          { bg: "#e8f5f0", color: C.secondary },
  Ramadhan:       { bg: "#fdf3dc", color: "#b07d1a" },
  Ibadah:         { bg: "#e8edf8", color: "#3a5aad" },
  "Kisah Nabi":   { bg: "#fde8e8", color: "#c0392b" },
  Tafsir:         { bg: "#eaf0e6", color: "#4a7c40" },
};

function CategoryBadge({ label }: { label: string }) {
  const s = BADGE_COLORS[label] ?? { bg: "#e8f5f0", color: C.secondary };
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.badgeText, { color: s.color }]}>{label}</Text>
    </View>
  );
}

// ── SCREEN ─────────────────────────────────────────────
export default function ArtikelScreen() {
  const [data, setData]     = useState<Artikel[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [activeCategory, setActiveCategory] = useState("Semua");

  const load = () => {
    setStatus("loading");
    fetch(RSS_URL)
      .then((res) => res.json())
      .then((json) => {
        if (json.status !== "ok" || !Array.isArray(json.items))
          throw new Error("Bad response");
        setData(parseRSS(json.items as RSSItem[]));
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (activeCategory === "Semua") return data;

    return data.filter((a) =>
      a.kategori?.toLowerCase().includes(activeCategory.toLowerCase())
    );
  }, [data, activeCategory]);

  const renderItem = ({ item }: ListRenderItemInfo<Artikel>) => (
    <TouchableOpacity
      style={styles.articleCard}
      activeOpacity={0.8}
      onPress={() => Linking.openURL(item.link)}
    >
      {/* Gambar dari API */}
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: item.gambar }}
          style={styles.articleImage}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay} />
        <CategoryBadge label={item.kategori} />
        <Text style={styles.tanggalOverlay}>{item.tanggal}</Text>
      </View>

      {/* Body */}
      <View style={styles.articleBody}>
        <Text style={styles.articleJudul} numberOfLines={2}>{item.judul}</Text>
        <Text style={styles.articleRingkasan} numberOfLines={2}>{item.ringkasan}</Text>

        <View style={styles.articleFooter}>
          <View style={styles.authorRow}>
            <View style={styles.authorAvatar}>
              <Feather name="user" size={11} color={C.secondary} />
            </View>
            <Text style={styles.authorText}>{item.penulis}</Text>
          </View>
          <TouchableOpacity
            style={styles.bacaBtn}
            onPress={() => Linking.openURL(item.link)}
          >
            <Text style={styles.bacaBtnText}>Baca Selengkapnya</Text>
            <Feather name="arrow-up-right" size={12} color={C.secondary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconBox}>
            <Feather name="book-open" size={18} color={C.accent} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Artikel</Text>
            <Text style={styles.headerSub}>Berita dan artikel Islami terkini</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={load}>
          <Feather name="refresh-cw" size={17} color="rgba(255,255,255,0.85)" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.tab, activeCategory === cat && styles.tabActive]}
              onPress={() => setActiveCategory(cat)}
              activeOpacity={0.75}
            >
              <Text style={[styles.tabText, activeCategory === cat && styles.tabTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* States */}
      {status === "loading" && (
        <View style={styles.stateWrap}>
          <ActivityIndicator size="large" color={C.secondary} />
          <Text style={styles.stateText}>Memuat artikel...</Text>
        </View>
      )}

      {status === "error" && (
        <View style={styles.stateWrap}>
          <Feather name="wifi-off" size={44} color="#c5d5d5" />
          <Text style={styles.stateText}>Gagal memuat artikel</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={load}>
            <Text style={styles.retryText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      )}

      {status === "success" && filtered.length === 0 && (
        <View style={styles.stateWrap}>
          <Feather name="inbox" size={44} color="#c5d5d5" />
          <Text style={styles.stateText}>Tidak ada artikel di kategori ini</Text>
        </View>
      )}

      {status === "success" && filtered.length > 0 && (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
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

  stateWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
  stateText: { fontSize: 14, color: C.muted, fontWeight: "500" },
  retryBtn: { backgroundColor: C.secondary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  retryText: { color: "#fff", fontSize: 13, fontWeight: "700" },

  header: {
    backgroundColor: C.primary,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "rgba(226,194,117,0.15)",
    borderWidth: 1, borderColor: "rgba(226,194,117,0.25)",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 20, color: "#fff", fontWeight: "700" },
  headerSub: { fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 1 },
  refreshBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
  },

  tabsWrap: { backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border },
  tabsContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  tab: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, backgroundColor: C.bg,
    borderWidth: 1, borderColor: C.border,
  },
  tabActive: { backgroundColor: C.secondary, borderColor: C.secondary },
  tabText: { fontSize: 13, color: C.muted, fontWeight: "600" },
  tabTextActive: { color: "#fff" },

  listContent: { padding: 16, paddingBottom: 100 },

  articleCard: {
    backgroundColor: C.card, borderRadius: 16, overflow: "hidden",
    shadowColor: C.primary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
    borderWidth: 1, borderColor: C.border,
  },
  imageWrap: { position: "relative", height: 190 },
  articleImage: { width: "100%", height: "100%" },
  imageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(15,61,62,0.15)" },
  badge: {
    position: "absolute", top: 12, left: 12,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  badgeText: { fontSize: 11, fontWeight: "700" },
  tanggalOverlay: {
    position: "absolute", top: 12, right: 12,
    fontSize: 11, color: "rgba(255,255,255,0.9)", fontWeight: "600",
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
  },
  articleBody: { padding: 14 },
  articleJudul: { fontSize: 16, fontWeight: "700", color: C.text, lineHeight: 24, marginBottom: 7 },
  articleRingkasan: { fontSize: 13, color: C.muted, lineHeight: 20, marginBottom: 12 },
  articleFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  authorAvatar: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: "#e8f5f0", alignItems: "center", justifyContent: "center",
  },
  authorText: { fontSize: 12, color: C.muted, fontWeight: "600" },
  bacaBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  bacaBtnText: { fontSize: 12, color: C.secondary, fontWeight: "700" },
});