import { Feather } from '@expo/vector-icons';
import { Share } from 'react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ── THEME (SAMA PERSIS) ──────────────────────────────
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

export default function DonasiPage() {
  const router = useRouter();
  const handleShare = async () => {
  try {
    const message = `
🤲 Dukung Developer Uang Pesat

Uang Pesat adalah aplikasi gratis tanpa iklan.
Yuk dukung pengembangan aplikasi ini 🙌

Support di:
https://saweria.co/

Terima kasih atas dukungannya 🤍
    `.trim();

    await Share.share({
      title: 'Dukung Developer Uang Pesat',
      message,
    });
  } catch (error) {
    console.log('Share error:', error);
  }
};

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color={C.text} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Dukung Developer</Text>

          <TouchableOpacity onPress={handleShare}>
            <Feather name="share-2" size={18} color={C.muted} />
          </TouchableOpacity>
        </View>

        {/* MILESTONE */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Milestone Dukungan</Text>
          <Text style={styles.sectionDesc}>
            Uang Pesat adalah aplikasi gratis tanpa iklan yang dibuat dengan penuh cinta
          </Text>

          <View style={styles.milestoneBox}>
            <Text style={styles.milestoneTitle}>
              Bayar server dan akomodasi
            </Text>

            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>

            <Text style={styles.progressText}>
              Rp75.000 / Rp50.000.000
            </Text>
          </View>
        </View>

        {/* SAWERIA */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>DUKUNGAN VIA SAWERIA</Text>

          <Text style={styles.sectionTitle}>
            Scan QR atau buka Saweria
          </Text>
          <Text style={styles.sectionDesc}>
            Semua dukungan akan masuk langsung ke halaman Saweria.
          </Text>

          <View style={styles.qrBox}>
            <Image
              source={{ uri: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://saweria.co/' }}
              style={styles.qr}
            />
          </View>

          <TouchableOpacity style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Buka Saweria</Text>
          </TouchableOpacity>
        </View>

        {/* CATATAN */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Catatan Development & Transparansi
          </Text>

          <Text style={styles.noteText}>
            1. Ini dukungan untuk developer, bukan penggalangan donasi lembaga.
          </Text>
          <Text style={styles.noteText}>
            2. Penyaluran & pihak lain sepenuhnya keputusan pribadi developer.
          </Text>
        </View>

        {/* LEADERBOARD */}
        <View style={[styles.card, { marginBottom: 40 }]}>
          <Text style={styles.sectionTitle}>
            Leaderboard Dukungan
          </Text>

          <View style={styles.leaderItem}>
            <Text style={styles.leaderName}>Anonymous</Text>
            <Text style={styles.leaderAmount}>Rp50.000</Text>
          </View>

          <View style={styles.leaderItem}>
            <Text style={styles.leaderName}>Hamba Allah</Text>
            <Text style={styles.leaderAmount}>Rp25.000</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ── STYLES ─────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },

  card: {
    backgroundColor: C.card,
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
    marginBottom: 6,
  },

  sectionDesc: {
    fontSize: 12,
    color: C.muted,
    marginBottom: 14,
    lineHeight: 18,
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: C.muted,
    marginBottom: 6,
  },

  milestoneBox: {
    backgroundColor: C.bg,
    borderRadius: 14,
    padding: 14,
  },

  milestoneTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
    color: C.text,
  },

  progressBar: {
    height: 10,
    backgroundColor: '#dfe9e7',
    borderRadius: 10,
    overflow: 'hidden',
  },

  progressFill: {
    width: '10%',
    height: '100%',
    backgroundColor: C.secondary,
  },

  progressText: {
    fontSize: 11,
    color: C.muted,
    marginTop: 8,
  },

  qrBox: {
    alignItems: 'center',
    marginVertical: 16,
  },

  qr: {
    width: 180,
    height: 180,
    borderRadius: 16,
  },

  primaryBtn: {
    backgroundColor: C.secondary,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
  },

  primaryBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 13,
  },

  noteText: {
    fontSize: 11,
    color: C.muted,
    marginBottom: 6,
    lineHeight: 17,
  },

  leaderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },

  leaderName: {
    fontSize: 12,
    color: C.text,
    fontWeight: '600',
  },

  leaderAmount: {
    fontSize: 12,
    color: C.secondary,
    fontWeight: '700',
  },
});