import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const C = {
  primary:   '#0F3D3E',
  secondary: '#1F6F5C',
  accent:    '#E2C275',
  bg:        '#F4F1EA',
  card:      '#FFFFFF',
  text:      '#1a2e2e',
  muted:     '#7A8C8C',
  border:    'rgba(15,61,62,0.08)',
} as const;

export default function LainnyaPage() {
  const router = useRouter();

  const menus = [
    { icon: 'book-open', label: 'Al-Quran', route: '/quran' },
    { icon: 'message-circle', label: 'Doa Harian', route: '/doa' },
    { icon: 'globe', label: 'Dzikir', route: '/dzikir' },
    { icon: 'book', label: 'Hadits', route: '/hadits' },
    { icon: 'compass', label: 'Arah Kiblat', route: '/kiblat' },
    { icon: 'heart', label: 'Donasi', route: '/donasi' },
    { icon: 'star', label: 'Asmaul Husna', route: '/asmaulhusna' },
  ];

  const others = [
    {
      icon: 'calendar',
      title: 'Kalender Hijriah',
      desc: 'Tanggal hijriah hari ini dan info singkat',
    },
    {
      icon: 'percent',
      title: 'Zakat Calculator',
      desc: 'Hitung zakat mal dengan cepat',
    },
    {
      icon: 'play-circle',
      title: 'Kajian Online',
      desc: 'Akses kajian dari berbagai sumber',
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color={C.text} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Lainnya</Text>

          <TouchableOpacity onPress={() => router.push('/pengaturan')}>
            <Feather name="settings" size={18} color={C.text} />
          </TouchableOpacity>
        </View>

        {/* GRID MENU */}
        <View style={styles.grid}>
          {menus.map((item, index) => (
            <TouchableOpacity key={index} style={styles.gridItem} onPress={() => router.push(item.route as any)}>
              <View style={styles.iconCircle}>
                <Feather name={item.icon as any} size={20} color={C.secondary} />
              </View>
              <Text style={styles.gridLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SECTION LAINNYA */}
        <Text style={styles.sectionLabel}>LAINNYA</Text>

        <View style={{ marginBottom: 40 }}>
          {others.map((item, index) => (
            <TouchableOpacity key={index} style={styles.card}>
              <View style={styles.cardLeft}>
                <View style={styles.smallIcon}>
                  <Feather name={item.icon as any} size={18} color={C.secondary} />
                </View>

                <View>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardDesc}>{item.desc}</Text>
                </View>
              </View>

              <Feather name="chevron-right" size={18} color={C.muted} />
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },

  gridItem: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 20,
  },

  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E9EFEF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },

  gridLabel: {
    fontSize: 11,
    textAlign: 'center',
    color: C.text,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.muted,
    marginLeft: 22,
    marginBottom: 8,
  },

  card: {
    backgroundColor: C.card,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  smallIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E9EFEF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: C.text,
  },

  cardDesc: {
    fontSize: 11,
    color: C.muted,
    marginTop: 2,
  },
});