import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

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

function SectionLabel({ title }: { title: string }) {
  return (
    <Text style={styles.sectionLabel}>{title}</Text>
  );
}

interface SettingRowProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  isFirst?: boolean;
  isLast?: boolean;
}

function SettingRow({ icon, iconBg, title, subtitle, onPress, right, isFirst, isLast }: SettingRowProps) {
  return (
    <TouchableOpacity
      style={[
        styles.row,
        isFirst && styles.rowFirst,
        isLast && styles.rowLast,
        !isLast && styles.rowBorder,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.rowIconBox, { backgroundColor: iconBg }]}>
        {icon}
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSub}>{subtitle}</Text> : null}
      </View>
      <View style={styles.rowRight}>
        {right ?? <Feather name="chevron-right" size={18} color="#c5d5d5" />}
      </View>
    </TouchableOpacity>
  );
}

export default function PengaturanScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(true);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pengaturan</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Akun Card */}
        <View style={styles.akunCard}>
          <View style={styles.akunAvatar}>
            <Feather name="user" size={28} color={C.muted} />
          </View>
          <View style={styles.akunInfo}>
            <Text style={styles.akunTitle}>Masuk Akun</Text>
            <Text style={styles.akunSub}>Sync bookmark & progress</Text>
            <View style={styles.developBadge}>
              <Text style={styles.developText}>DEVELOP</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.masukBtn} activeOpacity={0.8}>
            <Feather name="log-in" size={14} color="white" />
            <Text style={styles.masukText}>Masuk</Text>
          </TouchableOpacity>
        </View>

        {/* NOTIFIKASI */}
        <SectionLabel title="NOTIFIKASI" />
        <View style={styles.group}>
          <SettingRow
            isFirst isLast
            iconBg="#e8f5f0"
            icon={<Feather name="bell" size={17} color={C.secondary} />}
            title="Pengaturan Notifikasi"
            subtitle="Notifikasi adzan, dan harian"
            right={
              <Switch
                value={notifEnabled}
                onValueChange={setNotifEnabled}
                trackColor={{ false: "#d0dede", true: C.secondary }}
                thumbColor="#fff"
                style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
              />
            }
          />
        </View>

        {/* TAMPILAN */}
        <SectionLabel title="TAMPILAN" />
        <View style={styles.group}>
          <SettingRow
            isFirst
            iconBg="#e0f0ef"
            icon={<Feather name="moon" size={17} color="#1a7a78" />}
            title="Mode Gelap"
            subtitle="Tampilan lebih nyaman di malam hari"
            right={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: "#d0dede", true: C.secondary }}
                thumbColor="#fff"
                style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
              />
            }
          />
          <SettingRow
            isLast
            iconBg="#fdf3dc"
            icon={<Feather name="type" size={17} color="#c9972a" />}
            title="Ukuran Font Arab"
            subtitle="Sedang"
          />
        </View>

        {/* DUKUNGAN */}
        <SectionLabel title="DUKUNGAN" />
        <View style={styles.group}>
          <SettingRow
            isFirst
            iconBg="#e8edf8"
            icon={<Feather name="heart" size={17} color="#3a5aad" />}
            title="Dukung Developer"
            subtitle="Kontribusi untuk biaya maintenance & fitur baru"
          />
          <SettingRow
            iconBg="#fdf3dc"
            icon={<Feather name="star" size={17} color="#c9972a" />}
            title="Beri Rating"
            subtitle="Bantu kami dengan memberikan rating"
          />
          <SettingRow
            iconBg="#e8f5f0"
            icon={<Feather name="share-2" size={17} color={C.secondary} />}
            title="Bagikan Aplikasi"
            subtitle="Ajak teman menggunakan aplikasi ini"
          />
          <SettingRow
            isLast
            iconBg="#fde8e8"
            icon={<Feather name="mail" size={17} color="#c0392b" />}
            title="Kirim Feedback"
            subtitle="Sampaikan saran dan masukan"
          />
        </View>

        {/* TENTANG */}
        <SectionLabel title="TENTANG" />
        <View style={styles.group}>
          <SettingRow
            isFirst
            iconBg="#eaf0e6"
            icon={<Feather name="shield" size={17} color="#4a7c40" />}
            title="Kebijakan Privasi"
          />
          <SettingRow
            iconBg="#e0f0ef"
            icon={<Feather name="file-text" size={17} color="#1a7a78" />}
            title="Syarat & Ketentuan"
          />
          <SettingRow
            isLast
            iconBg="#f5ede8"
            icon={<Feather name="info" size={17} color="#8a5a3a" />}
            title="Versi Aplikasi"
            subtitle="1.0.0"
            right={
              <View style={styles.versiPill}>
                <Text style={styles.versiPillText}>Terbaru</Text>
              </View>
            }
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <MaterialCommunityIcons name="mosque" size={22} color={C.secondary} style={{ opacity: 0.4 }} />
          <Text style={styles.footerText}>Dibuat dengan ❤️ untuk umat Islam</Text>
          <Text style={styles.footerVer}>v1.0.0</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: C.bg,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: C.text,
    letterSpacing: 0.2,
  },

  // Akun Card
  akunCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: C.border,
  },
  akunAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: C.border,
    flexShrink: 0,
  },
  akunInfo: { flex: 1 },
  akunTitle: { fontSize: 15, fontWeight: "700", color: C.text },
  akunSub: { fontSize: 12, color: C.muted, marginTop: 2 },
  developBadge: {
    marginTop: 6,
    alignSelf: "flex-start",
    backgroundColor: C.accent + "30",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.accent + "60",
  },
  developText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#b07d1a",
    letterSpacing: 0.5,
  },
  masukBtn: {
    backgroundColor: C.secondary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  masukText: { color: "white", fontSize: 13, fontWeight: "700" },

  // Section label
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.muted,
    letterSpacing: 0.8,
    paddingHorizontal: 20,
    marginBottom: 6,
    marginTop: 4,
  },

  // Group
  group: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: C.card,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: C.border,
  },

  // Row
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
    backgroundColor: C.card,
  },
  rowFirst: { borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  rowLast:  { borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  rowIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rowBody: { flex: 1 },
  rowTitle: { fontSize: 14, fontWeight: "600", color: C.text },
  rowSub: { fontSize: 12, color: C.muted, marginTop: 2, lineHeight: 17 },
  rowRight: { flexShrink: 0 },

  // Versi pill
  versiPill: {
    backgroundColor: "#e8f5f0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  versiPillText: { fontSize: 11, color: C.secondary, fontWeight: "700" },

  // Footer
  footer: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 8,
    gap: 6,
  },
  footerText: { fontSize: 12, color: C.muted, fontWeight: "500" },
  footerVer: { fontSize: 11, color: "#b0c4c4", fontWeight: "500" },
});