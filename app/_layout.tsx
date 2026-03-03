import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="surah/[nomor]" options={{ headerShown: false }} />
        <Stack.Screen name="doa" options={{ headerShown: false }} />
        <Stack.Screen name="doa/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="dzikir" options={{ headerShown: false }} />
        <Stack.Screen name="dzikir/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="kiblat" options={{ headerShown: false }} />
        <Stack.Screen name="hadits" options={{ headerShown: false }} />
        <Stack.Screen name="hadits/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="donasi" options={{ headerShown: false }} />
        <Stack.Screen name="asmaulhusna" options={{ headerShown: false }} />
        <Stack.Screen name="lainnya" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
