import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Location from "expo-location";
import { Magnetometer } from "expo-sensors";

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

// Koordinat Ka'bah
const KAABA = { lat: 21.4225, lng: 39.8262 };

function toRad(deg: number) { return (deg * Math.PI) / 180; }
function toDeg(rad: number) { return (rad * 180) / Math.PI; }

// Hitung bearing dari lokasi user ke Ka'bah
function calcQiblaAngle(lat: number, lng: number): number {
  const dLng = toRad(KAABA.lng - lng);
  const lat1 = toRad(lat);
  const lat2 = toRad(KAABA.lat);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

// Hitung arah kompas dari magnetometer
function calcHeading(x: number, y: number): number {
  let angle = toDeg(Math.atan2(y, x));
  if (Platform.OS === "ios") angle = -angle;
  return (angle + 360) % 360;
}

export default function ArahKiblatScreen() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [cityName, setCityName] = useState("Mendeteksi lokasi...");
  const [heading, setHeading] = useState(0);
  const [qiblaAngle, setQiblaAngle] = useState<number | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const prevRotation = useRef(0);

  // Minta izin & ambil lokasi
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Izin Ditolak", "Izin lokasi diperlukan untuk menentukan arah kiblat.");
        setCityName("Izin lokasi ditolak");
        return;
      }
      setPermissionGranted(true);

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = pos.coords;
      setLocation({ lat: latitude, lng: longitude });
      setQiblaAngle(calcQiblaAngle(latitude, longitude));

      // Reverse geocode
      const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geo.length > 0) {
        const g = geo[0];
        setCityName([g.city, g.country].filter(Boolean).join(", ") || "Lokasi Ditemukan");
      }
    })();
  }, []);

  // Magnetometer subscription
  useEffect(() => {
    Magnetometer.setUpdateInterval(100);
    const sub = Magnetometer.addListener(({ x, y }) => {
      const h = calcHeading(x, y);
      setHeading(h);
    });
    return () => sub.remove();
  }, []);

  // Animasi rotasi jarum kiblat
  useEffect(() => {
    if (qiblaAngle === null) return;

    // Sudut jarum = arah kiblat - heading kompas
    const targetAngle = (qiblaAngle - heading + 360) % 360;

    // Hindari rotasi balik arah jarum jam yang panjang
    let diff = targetAngle - prevRotation.current;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    const smoothTarget = prevRotation.current + diff;
    prevRotation.current = smoothTarget;

    Animated.timing(rotateAnim, {
      toValue: smoothTarget,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [heading, qiblaAngle]);

  const needleRotation = rotateAnim.interpolate({
    inputRange: [-360, 360],
    outputRange: ["-360deg", "360deg"],
  });

  // Arah dalam teks (kiri/kanan)
  const getDirectionText = (): string => {
    if (qiblaAngle === null) return "Menghitung...";
    const diff = ((qiblaAngle - heading + 360) % 360);
    if (diff < 5 || diff > 355) return "Menghadap Kiblat ✓";
    if (diff <= 180) return `Putar ke kanan ${Math.round(diff)}°`;
    return `Putar ke kiri ${Math.round(360 - diff)}°`;
  };

  const isAligned =
    qiblaAngle !== null &&
    (((qiblaAngle - heading + 360) % 360) < 5 ||
      ((qiblaAngle - heading + 360) % 360) > 355);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.85)" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Arah Kiblat</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Feather name="more-vertical" size={20} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </View>

      {/* Body */}
      <View style={styles.body}>

        {/* Lokasi */}
        <View style={styles.locationChip}>
          <Feather name="map-pin" size={13} color={C.secondary} />
          <Text style={styles.locationText}>{cityName}</Text>
        </View>

        {/* Arah teks */}
        <Text style={[styles.directionText, isAligned && styles.directionAligned]}>
          {getDirectionText()}
        </Text>

        {/* Kompas */}
        <View style={styles.compassWrap}>

          {/* Lingkaran luar kompas */}
          <View style={[styles.compassRing, styles.compassRingOuter]}>
            {/* Derajat cardinal */}
            {["U", "T", "S", "B"].map((label, i) => {
              const angle = i * 90;
              const r = 130;
              const rad = toRad(angle - 90);
              return (
                <Text
                  key={label}
                  style={[
                    styles.cardinalLabel,
                    {
                      left: 140 + r * Math.cos(rad) - 10,
                      top:  140 + r * Math.sin(rad) - 10,
                      color: label === "U" ? "#e53935" : C.muted,
                    },
                  ]}
                >
                  {label}
                </Text>
              );
            })}

            {/* Tick marks */}
            {Array.from({ length: 36 }).map((_, i) => {
              const angle = i * 10;
              const isMajor = angle % 30 === 0;
              return (
                <View
                  key={i}
                  style={[
                    styles.tick,
                    isMajor ? styles.tickMajor : styles.tickMinor,
                    { transform: [{ rotate: `${angle}deg` }] },
                  ]}
                />
              );
            })}
          </View>

          {/* Inner circle */}
          <View style={styles.compassInner}>
            {/* Ka'bah watermark */}
            <MaterialCommunityIcons
              name="mosque"
              size={64}
              color={C.secondary}
              style={{ opacity: 0.08 }}
            />

            {/* Jarum kiblat */}
            <Animated.View
              style={[
                styles.needleWrap,
                { transform: [{ rotate: needleRotation }] },
              ]}
            >
              {/* Jarum atas (menunjuk kiblat) */}
              <View style={styles.needleTop} />
              {/* Titik tengah */}
              <View style={styles.needleCenter} />
              {/* Jarum bawah */}
              <View style={styles.needleBottom} />
            </Animated.View>

            {/* Derajat */}
            {qiblaAngle !== null && (
              <Text style={styles.degreeLabel}>
                {Math.round(qiblaAngle)}°
              </Text>
            )}
          </View>

          {/* Aligned glow */}
          {isAligned && <View style={styles.alignedGlow} />}
        </View>

        {/* Info kiblat */}
        {qiblaAngle !== null && (
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Feather name="navigation" size={14} color={C.secondary} />
              <Text style={styles.infoLabel}>Arah Kiblat</Text>
              <Text style={styles.infoValue}>{Math.round(qiblaAngle)}°</Text>
            </View>
            <View style={styles.infoDiv} />
            <View style={styles.infoItem}>
              <Feather name="compass" size={14} color={C.secondary} />
              <Text style={styles.infoLabel}>Kompas</Text>
              <Text style={styles.infoValue}>{Math.round(heading)}°</Text>
            </View>
            <View style={styles.infoDiv} />
            <View style={styles.infoItem}>
              <Feather name="map-pin" size={14} color={C.secondary} />
              <Text style={styles.infoLabel}>Koordinat</Text>
              <Text style={styles.infoValue}>
                {location
                  ? `${location.lat.toFixed(2)}, ${location.lng.toFixed(2)}`
                  : "-"}
              </Text>
            </View>
          </View>
        )}

        {/* CTA Button */}
        <TouchableOpacity style={styles.ctaBtn} activeOpacity={0.85}>
          <MaterialCommunityIcons name="camera" size={18} color={C.card} />
          <Text style={styles.ctaBtnText}>Tentukan Kiblat Pakai Kamera</Text>
        </TouchableOpacity>
        <Text style={styles.ctaHint}>
          Jauhkan ponsel dari benda logam agar kompas stabil.
        </Text>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    backgroundColor: C.primary,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 18,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  iconBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 18, color: "#fff", fontWeight: "700" },

  // Body
  body: {
    flex: 1,
    alignItems: "center",
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },

  locationChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: C.card,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1, borderColor: C.border,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    marginBottom: 10,
  },
  locationText: { fontSize: 14, color: C.text, fontWeight: "600" },

  directionText: {
    fontSize: 14, color: C.muted, fontWeight: "600",
    marginBottom: 28, letterSpacing: 0.2,
  },
  directionAligned: { color: C.secondary },

  // Compass
  compassWrap: {
    width: 280, height: 280,
    alignItems: "center", justifyContent: "center",
    marginBottom: 24,
    position: "relative",
  },
  compassRing: {
    position: "absolute",
    borderRadius: 999,
    alignItems: "center", justifyContent: "center",
  },
  compassRingOuter: {
    width: 280, height: 280,
    borderWidth: 2, borderColor: C.border,
    backgroundColor: C.card,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 16, elevation: 6,
  },
  cardinalLabel: {
    position: "absolute",
    fontSize: 13, fontWeight: "700", width: 20, textAlign: "center",
  },
  tick: {
    position: "absolute",
    top: 0, left: "50%",
    width: 1,
    transformOrigin: "bottom center",
  },
  tickMajor: { height: 14, backgroundColor: C.muted, opacity: 0.6, marginLeft: -0.5 },
  tickMinor: { height: 8,  backgroundColor: C.border, opacity: 0.8, marginLeft: -0.5 },

  compassInner: {
    width: 200, height: 200,
    borderRadius: 100,
    backgroundColor: C.bg,
    borderWidth: 1, borderColor: C.border,
    alignItems: "center", justifyContent: "center",
    position: "relative",
  },

  // Jarum
  needleWrap: {
    position: "absolute",
    width: 6, height: 160,
    alignItems: "center",
    justifyContent: "center",
  },
  needleTop: {
    width: 0, height: 0,
    borderLeftWidth: 5, borderRightWidth: 5, borderBottomWidth: 70,
    borderLeftColor: "transparent", borderRightColor: "transparent",
    borderBottomColor: C.secondary,
    marginBottom: -2,
  },
  needleCenter: {
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: C.card,
    borderWidth: 2, borderColor: C.secondary,
    zIndex: 10,
  },
  needleBottom: {
    width: 0, height: 0,
    borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 70,
    borderLeftColor: "transparent", borderRightColor: "transparent",
    borderTopColor: "#e53935",
    marginTop: -2,
  },

  degreeLabel: {
    position: "absolute", bottom: 18,
    fontSize: 12, color: C.muted, fontWeight: "700",
  },

  alignedGlow: {
    position: "absolute",
    width: 290, height: 290, borderRadius: 145,
    borderWidth: 3, borderColor: C.secondary,
    opacity: 0.35,
  },

  // Info row
  infoRow: {
    flexDirection: "row",
    backgroundColor: C.card,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    width: "100%",
    borderWidth: 1, borderColor: C.border,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    marginBottom: 20,
  },
  infoItem: { flex: 1, alignItems: "center", gap: 4 },
  infoDiv: { width: 1, backgroundColor: C.border },
  infoLabel: { fontSize: 11, color: C.muted, fontWeight: "500" },
  infoValue: { fontSize: 13, color: C.text, fontWeight: "700" },

  // CTA
  ctaBtn: {
    backgroundColor: C.secondary,
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 24, paddingVertical: 15,
    borderRadius: 16, width: "100%", justifyContent: "center",
    shadowColor: C.secondary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
    marginBottom: 10,
  },
  ctaBtnText: { color: C.card, fontSize: 15, fontWeight: "700" },
  ctaHint: { fontSize: 12, color: C.muted, textAlign: "center" },
});