import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// ── THEME ──────────────────────────────────────────────
const C = {
  primary:   '#0F3D3E',
  secondary: '#1F6F5C',
  accent:    '#E2C275',
  bg:        '#F0F4F3',
  card:      '#FFFFFF',
  text:      '#1a2e2e',
  muted:     '#6B8B8B',
  border:    'rgba(15,61,62,0.07)',
} as const;

// ── TYPES ──────────────────────────────────────────────
type IconLib = 'Feather' | 'MCI' | 'Ionicons';

interface IconProps {
  lib: IconLib;
  name: string;
  size: number;
  color: string;
  style?: object;
}

interface PrayerItem {
  name: string;
  icon: string;
  lib: IconLib;
  time: string;
  active?: boolean;
}

interface MenuItem {
  icon: string;
  lib: IconLib;
  label: string;
  bg: string;
  color: string;
  route: Href;
}

interface DoaCard {
  id: string;
  icon: string;
  lib: IconLib;
  title: string;
  desc: string;
  amin: number;
}

interface NavItem {
  icon: string;
  lib: IconLib;
  label: string;
  isAI?: boolean;
}

// ── DATA ───────────────────────────────────────────────
const PRAYERS: PrayerItem[] = [
  { name: 'Subuh',   icon: 'moon',    lib: 'Feather', time: '04:43' },
  { name: 'Dzuhur',  icon: 'sun',     lib: 'Feather', time: '12:09' },
  { name: 'Ashar',   icon: 'cloud',   lib: 'Feather', time: '15:12' },
  { name: 'Maghrib', icon: 'sunset',  lib: 'Feather', time: '18:15' },
  { name: 'Isya',    icon: 'star',    lib: 'Feather', time: '19:24' },
];

const MENUS: MenuItem[] = [
  { icon: 'book-open', lib: 'Feather', label: 'Al-Quran', bg: '#e8f5f0', color: '#1F6F5C', route: '/quran' },
  { icon: 'message-circle', lib: 'Feather', label: 'Doa Harian', bg: '#fdf3dc', color: '#c9972a', route: '/doa' },
  { icon: 'globe', lib: 'Feather', label: 'Dzikir', bg: '#e0f0ef', color: '#1a7a78', route: '/dzikir' },
  { icon: 'book', lib: 'Feather', label: 'Hadits', bg: '#e8edf8', color: '#3a5aad', route: '/hadits' },
  { icon: 'compass', lib: 'Feather', label: 'Arah Kiblat', bg: '#fde8e8', color: '#c0392b', route: '/kiblat' },
  { icon: 'heart', lib: 'Feather', label: 'Donasi', bg: '#d1ebe3', color: '#1F6F5C', route: '/donasi' },
  { icon: 'star', lib: 'Feather', label: 'Asmaul Husna', bg: '#eaf0e6', color: '#4a7c40', route: '/asmaulhusna' },
  { icon: 'grid', lib: 'Feather', label: 'Lainnya', bg: '#f5ede8', color: '#8a5a3a', route: '/lainnya' },
];

const DOA_CARDS: DoaCard[] = [
  { id: '1', icon: 'user',  lib: 'Feather', title: 'Kelancaran Usaha', desc: 'Mohon doanya untuk kelancaran usaha kami di bulan berkah ini...', amin: 142 },
  { id: '2', icon: 'heart', lib: 'Feather', title: 'Kesembuhan Ibu',   desc: 'Mohon doa untuk kesehatan ibunda tercinta yang sedang sakit...', amin: 89 },
  { id: '3', icon: 'award', lib: 'Feather', title: 'Lulus Ujian',      desc: 'Mohon doa semoga dimudahkan dalam menghadapi ujian akhir...', amin: 67 },
];

// ── ICON HELPER ────────────────────────────────────────
function AppIcon({ lib, name, size, color, style }: IconProps) {
  if (lib === 'MCI') {
    return (
      <MaterialCommunityIcons
        name={name as React.ComponentProps<typeof MaterialCommunityIcons>['name']}
        size={size}
        color={color}
        style={style}
      />
    );
  }
  if (lib === 'Ionicons') {
    return (
      <Ionicons
        name={name as React.ComponentProps<typeof Ionicons>['name']}
        size={size}
        color={color}
        style={style}
      />
    );
  }
  return (
    <Feather
      name={name as React.ComponentProps<typeof Feather>['name']}
      size={size}
      color={color}
      style={style}
    />
  );
}

// ── HEADER ─────────────────────────────────────────────
function Header() {
  const [time, setTime] = useState<string>('');
  const [hijri, setHijri] = useState<string>('');

  useEffect(() => {
  const tick = () => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    setTime(`${h}.${m}`);
  };

  tick();
  const id = setInterval(tick, 1000);

  // 🔥 FETCH HIJRI DATE
  fetch('https://api.aladhan.com/v1/gToH')
    .then(res => res.json())
    .then(data => {
      const d = data.data.hijri;
      setHijri(`${d.day} ${d.month.en} ${d.year} H`);
    })
    .catch(() => setHijri('Hijriyah unavailable'));

  return () => clearInterval(id);
}, []);

  return (
    <View style={styles.header}>
      {/* Top row */}
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.hijriDate}>
            {hijri || 'Loading...'}
          </Text>
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={10} color="rgba(255,255,255,0.5)" />
            <Text style={styles.location}>  Bogor, Indonesia</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Feather name="bell" size={18} color="rgba(255,255,255,0.85)" />
        </TouchableOpacity>
      </View>

      {/* Clock */}
      <View style={styles.clockSection}>
        <Text style={styles.clock}>{time || '21.13'}</Text>
        <Text style={styles.countdown}>
          Subuh dalam{' '}
          <Text style={styles.countdownAccent}>07:29:10</Text>
        </Text>
      </View>

      <View style={styles.divider} />

      {/* Prayer times */}
      <View style={styles.prayerRow}>
        {PRAYERS.map((p) => (
          <View key={p.name} style={styles.prayerItem}>
            <Text style={[styles.prayerName, p.active && styles.prayerNameActive]}>
              {p.name}
            </Text>
            <View style={[styles.prayerIconBox, p.active && styles.prayerIconBoxActive]}>
              <AppIcon
                lib={p.lib}
                name={p.icon}
                size={15}
                color={p.active ? C.accent : 'rgba(255,255,255,0.65)'}
              />
            </View>
            <Text style={[styles.prayerTime, p.active && styles.prayerTimeActive]}>
              {p.time}
            </Text>
            {p.active && <View style={styles.activeDot} />}
          </View>
        ))}
      </View>
    </View>
  );
}

// ── SEARCH ─────────────────────────────────────────────
function SearchBar() {
  return (
    <View style={styles.searchWrap}>
      <View style={styles.searchBox}>
        <Feather name="search" size={16} color={C.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari surat, doa, artikel, hadits ..."
          placeholderTextColor="#b0c4c4"
        />
      </View>
    </View>
  );
}

// ── MENU GRID ──────────────────────────────────────────
function MenuGrid() {
  const router = useRouter();

  return (
    <View style={styles.menuSection}>
      <View style={styles.menuGrid}>
        {MENUS.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.menuItem}
            activeOpacity={0.75}
            onPress={() => router.push(item.route)}
          >
            <View style={[styles.menuIconBox, { backgroundColor: item.bg }]}>
              <AppIcon lib={item.lib} name={item.icon} size={22} color={item.color} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ── RAMADAN CARD ───────────────────────────────────────
function RamadanCard() {
  return (
    <View style={styles.ramadanCard}>
      <View style={styles.ramadanIconWrap}>
        <MaterialCommunityIcons name="moon-waning-crescent" size={28} color={C.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.ramadanTitle}>Ramadhan Mubarak!</Text>
        <Text style={styles.ramadanSub}>Selamat menjalankan ibadah puasa</Text>
      </View>
      <MaterialCommunityIcons
        name="mosque"
        size={52}
        color={C.accent}
        style={styles.ramadanDeco}
      />
    </View>
  );
}

// ── DOA SECTION ────────────────────────────────────────
function DoaSection() {
  const renderDoa = ({ item }: ListRenderItemInfo<DoaCard>) => (
    <View style={styles.doaCard}>
      <View style={styles.doaCardIconWrap}>
        <AppIcon lib={item.lib} name={item.icon} size={20} color={C.secondary} />
      </View>
      <Text style={styles.doaCardTitle}>{item.title}</Text>
      <Text style={styles.doaCardDesc} numberOfLines={2}>{item.desc}</Text>
      <View style={styles.doaCardTag}>
        <Feather name="heart" size={10} color={C.secondary} />
        <Text style={styles.doaCardTagText}>  {item.amin} amin</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.doaSection}>
      <View style={styles.doaHeader}>
        <Text style={styles.doaTitle}>Aminkan doa saudaramu</Text>
        <TouchableOpacity style={styles.buatDoaBtn} activeOpacity={0.8}>
          <Feather name="plus" size={13} color="white" />
          <Text style={styles.buatDoaText}> Buat doa</Text>
        </TouchableOpacity>
      </View>
      <FlatList<DoaCard>
        data={DOA_CARDS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 10, paddingRight: 16 }}
        renderItem={renderDoa}
      />
    </View>
  );
}

// ── MAIN ───────────────────────────────────────────────
export default function App() {
  const [activeNav, setActiveNav] = useState<number>(0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        <Header />
        <SearchBar />
        <MenuGrid />
        <RamadanCard />
        <DoaSection />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── STYLES ─────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },

  // Header
  header: { backgroundColor: C.primary, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  hijriDate: { fontSize: 13, color: C.accent, fontWeight: '600', letterSpacing: 0.3 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  location: { fontSize: 11, color: 'rgba(255,255,255,0.55)' },
  notifBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  clockSection: { alignItems: 'center', marginBottom: 16 },
  clock: { fontSize: 58, color: '#FFFFFF', letterSpacing: 2, lineHeight: 64, fontWeight: '300' },
  countdown: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  countdownAccent: { color: C.accent, fontWeight: '700' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: 16 },

  prayerRow: { flexDirection: 'row', justifyContent: 'space-between' },
  prayerItem: { flex: 1, alignItems: 'center' },
  prayerName: { fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  prayerNameActive: { color: C.accent },
  prayerIconBox: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center', marginVertical: 6,
  },
  prayerIconBoxActive: { backgroundColor: 'rgba(226,194,117,0.15)', borderWidth: 1, borderColor: 'rgba(226,194,117,0.4)' },
  prayerTime: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '700' },
  prayerTimeActive: { color: C.accent },
  activeDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: C.accent, marginTop: 5 },

  // Search
  searchWrap: { padding: 14, paddingBottom: 6 },
  searchBox: {
    backgroundColor: C.card, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 11,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  searchInput: { flex: 1, fontSize: 13, color: C.text, padding: 0 },

  // Menu
  menuSection: { paddingHorizontal: 16, paddingVertical: 10 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  menuItem: { width: (width - 32 - 36) / 4, alignItems: 'center', gap: 7 },
  menuIconBox: { width: 58, height: 58, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { fontSize: 11, color: C.text, fontWeight: '600', textAlign: 'center', lineHeight: 14 },

  // Ramadan Card
  ramadanCard: {
    marginHorizontal: 16, marginTop: 4, marginBottom: 4,
    backgroundColor: C.primary, borderRadius: 18,
    paddingHorizontal: 20, paddingVertical: 18,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 8, overflow: 'hidden',
  },
  ramadanIconWrap: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: 'rgba(226,194,117,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(226,194,117,0.25)',
  },
  ramadanTitle: { fontSize: 17, color: C.accent, fontWeight: '700' },
  ramadanSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 3 },
  ramadanDeco: { opacity: 0.1, position: 'absolute', right: 12 },

  // Doa
  doaSection: { paddingTop: 16, paddingLeft: 16, paddingBottom: 8 },
  doaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingRight: 16 },
  doaTitle: { fontSize: 15, fontWeight: '700', color: C.text },
  buatDoaBtn: { backgroundColor: C.secondary, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
  buatDoaText: { color: 'white', fontSize: 12, fontWeight: '700' },
  doaCard: {
    width: 160, backgroundColor: C.card, borderRadius: 14, padding: 14,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
    borderWidth: 1, borderColor: C.border,
  },
  doaCardIconWrap: { width: 38, height: 38, borderRadius: 11, backgroundColor: '#e8f5f0', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  doaCardTitle: { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 5 },
  doaCardDesc: { fontSize: 11, color: C.muted, lineHeight: 16 },
  doaCardTag: { marginTop: 10, alignSelf: 'flex-start', backgroundColor: '#e8f5f0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
  doaCardTagText: { fontSize: 10, color: C.secondary, fontWeight: '700' },

  navItem: { flex: 1, alignItems: 'center', gap: 4 },
  navItemAI: { marginTop: -18 },
  navIconWrap: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  navIconAI: {
    width: 50, height: 50, backgroundColor: C.secondary, borderRadius: 15,
    shadowColor: C.secondary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 8,
  },
  navLabel: { fontSize: 10, color: '#aabbbb', fontWeight: '500' },
  navLabelActive: { color: C.secondary, fontWeight: '700' },
  navLabelAI: { color: C.primary, fontWeight: '700' },
});