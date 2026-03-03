import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
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

const EXAMPLE_QUESTIONS = [
  "Apa amalan terbaik setelah shalat wajib?",
  "Jelaskan perbedaan zakat fitrah dan zakat maal",
  "Doa ketika merasa gelisah",
];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const INITIAL_MESSAGE: Message = {
  id: "init",
  role: "assistant",
  content:
    "Assalamualaikum! Saya siap bantu pertanyaan seputar Islam: Al-Quran, hadits, fiqih, doa, dan sejarah Islam.",
};

// ── DUMMY RESPONSES ────────────────────────────────────
const DUMMY_RESPONSES: { keywords: string[]; reply: string }[] = [
  {
    keywords: ["amalan", "setelah shalat", "setelah solat"],
    reply:
      "Amalan terbaik setelah shalat wajib antara lain:\n\n1. Membaca istighfar 3x: \"Astaghfirullah\"\n2. Membaca Ayat Kursi (QS. Al-Baqarah: 255)\n3. Tasbih 33x, Tahmid 33x, Takbir 33x\n4. Membaca doa setelah shalat\n\nRasulullah ﷺ bersabda: \"Barang siapa membaca Ayat Kursi setelah setiap shalat, tidak ada yang menghalanginya masuk surga kecuali kematian.\" (HR. An-Nasa'i)",
  },
  {
    keywords: ["zakat fitrah", "zakat maal", "perbedaan zakat"],
    reply:
      "Perbedaan Zakat Fitrah dan Zakat Maal:\n\n📌 Zakat Fitrah:\n• Wajib bagi setiap muslim yang mampu\n• Dikeluarkan sebelum shalat Idul Fitri\n• Besarnya 2,5 kg atau 3,5 liter beras\n• Tujuan: mensucikan diri dari dosa selama Ramadhan\n\n📌 Zakat Maal:\n• Wajib atas harta yang mencapai nisab dan haul\n• Besarnya 2,5% dari total harta\n• Berlaku untuk emas, perak, uang, hasil pertanian\n• Tujuan: membersihkan harta dari hak orang lain",
  },
  {
    keywords: ["gelisah", "doa gelisah", "cemas", "gundah"],
    reply:
      "Doa ketika merasa gelisah:\n\nاللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ\n\n\"Allahumma inni a'udzu bika minal hammi wal hazani, wal 'ajzi wal kasali, wal bukhli wal jubni, wa dhala'id daini wa ghalabatir rijal\"\n\nArtinya: Ya Allah, aku berlindung kepada-Mu dari rasa gelisah dan sedih, dari kelemahan dan kemalasan, dari sifat kikir dan pengecut, dari lilitan utang dan tekanan orang lain.\n\n(HR. Bukhari no. 6369)",
  },
  {
    keywords: ["shalat", "solat", "salat"],
    reply:
      "Shalat adalah tiang agama. Rasulullah ﷺ bersabda:\n\n\"Shalat adalah tiang agama, barang siapa mendirikannya maka ia telah menegakkan agama, dan barang siapa meninggalkannya maka ia telah meruntuhkan agama.\"\n(HR. Baihaqi)\n\nAda yang ingin ditanyakan lebih spesifik tentang shalat?",
  },
  {
    keywords: ["puasa", "ramadhan", "ramadan"],
    reply:
      "Puasa Ramadhan adalah rukun Islam yang wajib dilaksanakan setiap muslim yang baligh dan mampu. Allah berfirman:\n\n\"Wahai orang-orang yang beriman, diwajibkan atas kamu berpuasa sebagaimana diwajibkan atas orang-orang sebelum kamu agar kamu bertakwa.\"\n(QS. Al-Baqarah: 183)\n\nAda yang ingin ditanyakan lebih lanjut?",
  },
  {
    keywords: ["doa", "do'a"],
    reply:
      "Doa adalah senjata orang mukmin dan tiang agama. Rasulullah ﷺ bersabda: \"Doa adalah ibadah.\" (HR. Tirmidzi)\n\nSilakan sebutkan situasi spesifik yang kamu hadapi, insyaAllah saya bantu carikan doanya. 🤲",
  },
  {
    keywords: ["zakat", "infaq", "sedekah"],
    reply:
      "Zakat, infaq, dan sedekah adalah bentuk kepedulian sosial dalam Islam. Allah berfirman:\n\n\"Perumpamaan orang yang menginfakkan hartanya di jalan Allah seperti sebutir biji yang menumbuhkan tujuh tangkai, pada setiap tangkai ada seratus biji.\"\n(QS. Al-Baqarah: 261)\n\nApa yang ingin kamu ketahui lebih lanjut?",
  },
  {
    keywords: ["quran", "qur'an", "al-quran", "alquran"],
    reply:
      "Al-Quran adalah kitab suci umat Islam yang diturunkan kepada Nabi Muhammad ﷺ melalui Malaikat Jibril. Terdiri dari 114 surah dan 6.236 ayat.\n\nMembaca Al-Quran sangat dianjurkan karena setiap hurufnya bernilai 10 kebaikan. Apakah ada surah atau ayat tertentu yang ingin kamu tanyakan?",
  },
  {
    keywords: ["hadits", "hadist", "sunnah"],
    reply:
      "Hadits adalah perkataan, perbuatan, dan ketetapan Nabi Muhammad ﷺ yang menjadi sumber hukum Islam kedua setelah Al-Quran.\n\nKitab hadits yang paling shahih adalah Shahih Bukhari dan Shahih Muslim. Apakah ada hadits tertentu yang ingin kamu cari?",
  },
];

function getReply(text: string): string {
  const lower = text.toLowerCase();
  const match = DUMMY_RESPONSES.find((item) =>
    item.keywords.some((kw) => lower.includes(kw))
  );
  return (
    match?.reply ??
    "Jazakallahu khairan atas pertanyaannya. 🌿\n\nSebagai Asisten Islami, saya siap membantu seputar:\n• Al-Quran & Tafsir\n• Hadits & Sunnah\n• Fiqih & Ibadah\n• Doa & Dzikir\n• Sejarah Islam\n\nSilakan tanyakan lebih spesifik agar saya bisa memberikan jawaban yang lebih tepat. InsyaAllah saya bantu! 🤲"
  );
}

// ── SCREEN ─────────────────────────────────────────────
export default function AIScreen() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Simulasi delay seperti AI sungguhan
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: getReply(trimmed),
        },
      ]);
      setLoading(false);
    }, 1200);
  };

  const showExamples = messages.length === 1;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.85)" />
        </TouchableOpacity>

        <View style={styles.headerAvatarWrap}>
          <View style={styles.headerAvatar}>
            <MaterialCommunityIcons name="robot-excited" size={20} color={C.accent} />
          </View>
          <View style={styles.onlineDot} />
        </View>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Asisten Islami AI</Text>
          <Text style={styles.headerSub}>Fokus tanya jawab seputar Islam</Text>
        </View>

        <TouchableOpacity
          style={styles.clearBtn}
          onPress={() => setMessages([INITIAL_MESSAGE])}
        >
          <Feather name="trash-2" size={17} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* Chat Area */}
        <ScrollView
          ref={scrollRef}
          style={styles.chatArea}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Example Questions */}
          {showExamples && (
            <View style={styles.examplesWrap}>
              <Text style={styles.examplesLabel}>Contoh pertanyaan:</Text>
              {EXAMPLE_QUESTIONS.map((q) => (
                <TouchableOpacity
                  key={q}
                  style={styles.exampleChip}
                  onPress={() => sendMessage(q)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.exampleChipText}>{q}</Text>
                  <Feather name="arrow-up-right" size={13} color={C.muted} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.bubbleRow,
                msg.role === "user" ? styles.bubbleRowUser : styles.bubbleRowAI,
              ]}
            >
              {msg.role === "assistant" && (
                <View style={styles.aiAvatar}>
                  <MaterialCommunityIcons name="robot-excited" size={16} color={C.secondary} />
                </View>
              )}
              <View
                style={[
                  styles.bubble,
                  msg.role === "user" ? styles.bubbleUser : styles.bubbleAI,
                ]}
              >
                {msg.role === "assistant" && (
                  <Text style={styles.aiLabel}>Asisten AI</Text>
                )}
                <Text
                  style={[
                    styles.bubbleText,
                    msg.role === "user" && styles.bubbleTextUser,
                  ]}
                >
                  {msg.content}
                </Text>
              </View>
            </View>
          ))}

          {/* Loading */}
          {loading && (
            <View style={[styles.bubbleRow, styles.bubbleRowAI]}>
              <View style={styles.aiAvatar}>
                <MaterialCommunityIcons name="robot-excited" size={16} color={C.secondary} />
              </View>
              <View style={[styles.bubble, styles.bubbleAI, styles.loadingBubble]}>
                <ActivityIndicator size="small" color={C.secondary} />
                <Text style={styles.loadingText}>Sedang menjawab...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputWrap}>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="Tanyakan seputar Islam..."
              placeholderTextColor="#b0c4c4"
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={500}
              onSubmitEditing={() => sendMessage(input)}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                (!input.trim() || loading) && styles.sendBtnDisabled,
              ]}
              onPress={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              activeOpacity={0.8}
            >
              <Feather name="send" size={17} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── STYLES ─────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  header: {
    backgroundColor: C.primary,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  headerAvatarWrap: { position: "relative", flexShrink: 0 },
  headerAvatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(226,194,117,0.15)",
    borderWidth: 1, borderColor: "rgba(226,194,117,0.3)",
    alignItems: "center", justifyContent: "center",
  },
  onlineDot: {
    position: "absolute", bottom: 1, right: 1,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: "#4caf50",
    borderWidth: 2, borderColor: C.primary,
  },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 16, color: "#fff", fontWeight: "700" },
  headerSub: { fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 1 },
  clearBtn: {
    width: 34, height: 34, borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },

  chatArea: { flex: 1 },
  chatContent: { padding: 16, gap: 12, paddingBottom: 8 },

  examplesWrap: { marginBottom: 8 },
  examplesLabel: {
    fontSize: 12, color: C.muted, fontWeight: "600",
    marginBottom: 10, letterSpacing: 0.2,
  },
  exampleChip: {
    backgroundColor: C.card,
    borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    borderWidth: 1, borderColor: C.border,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4,
    elevation: 1,
  },
  exampleChipText: { fontSize: 13, color: C.text, fontWeight: "500", flex: 1 },

  bubbleRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  bubbleRowUser: { justifyContent: "flex-end" },
  bubbleRowAI:   { justifyContent: "flex-start" },

  aiAvatar: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: "#e8f5f0",
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
    borderWidth: 1, borderColor: "rgba(31,111,92,0.15)",
  },

  bubble: {
    maxWidth: "78%",
    borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 11,
  },
  bubbleUser: {
    backgroundColor: C.secondary,
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    backgroundColor: C.card,
    borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: C.border,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4,
    elevation: 1,
  },
  aiLabel: {
    fontSize: 10, color: C.secondary, fontWeight: "700",
    marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5,
  },
  bubbleText: { fontSize: 14, color: C.text, lineHeight: 22 },
  bubbleTextUser: { color: "white" },

  loadingBubble: { flexDirection: "row", alignItems: "center", gap: 8 },
  loadingText: { fontSize: 13, color: C.muted, fontStyle: "italic" },

  inputWrap: {
    backgroundColor: C.card,
    paddingHorizontal: 14, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: C.border,
  },
  inputBox: {
    flexDirection: "row", alignItems: "flex-end", gap: 10,
    backgroundColor: C.bg,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: C.border,
  },
  input: {
    flex: 1, fontSize: 14, color: C.text,
    maxHeight: 100, lineHeight: 20,
    paddingTop: 4, paddingBottom: 4,
  },
  sendBtn: {
    width: 38, height: 38, borderRadius: 11,
    backgroundColor: C.secondary,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
    shadowColor: C.secondary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35, shadowRadius: 8,
    elevation: 5,
  },
  sendBtnDisabled: { backgroundColor: "#b0c4c4", shadowOpacity: 0 },
});