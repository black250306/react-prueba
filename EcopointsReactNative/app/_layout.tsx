import { Stack } from "expo-router";
import { useEffect } from "react";
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  useEffect(() => {
    // This effect is for hiding the splash screen, but since we are handling that
    // in the AuthProvider now (after checking for tokens), this can be simplified.
    // The hide is called from within the AuthProvider now.
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <Stack>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="redeem-confirm" options={{ presentation: 'modal', title: 'Confirmar Canje' }} />
          <Stack.Screen name="redeem-success" options={{ presentation: 'modal', title: 'Canje Exitoso' }} />
          <Stack.Screen name="settings" options={{ title: 'Configuración' }} />
          <Stack.Screen name="notifications" options={{ title: 'Notificaciones' }} />
          <Stack.Screen name="privacy" options={{ title: 'Privacidad y Seguridad' }} />
          <Stack.Screen name="help" options={{ title: 'Ayuda y Soporte' }} />
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default RootLayout;

