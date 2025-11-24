import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type ForgotPasswordStep = 'login' | 'request' | 'verify' | 'reset';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const { width } = useWindowDimensions();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [forgotPasswordStep, setForgotPasswordStep] = useState<ForgotPasswordStep>('login');

  const API_BASE = 'https://ecopoints.hvd.lat/api';

  const isLargeScreen = width >= 900;

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setLoginError("");
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password) {
      Alert.alert("Error", "El email y la contraseña son obligatorios");
      return false;
    }
    if (!isLogin && !formData.nombre) {
      Alert.alert("Error", "El nombre completo es obligatorio");
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert("Error", "La nueva contraseña debe tener al menos 6 caracteres");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setLoginError("");

    const endpoint = isLogin ? "logeoUsuario" : "registrarUsuario";
    const body = isLogin
      ? { email: formData.email, password: formData.password }
      : { nombre: formData.nombre, email: formData.email, password: formData.password };

    try {
      const response = await fetch(`${API_BASE}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.mensaje || "Error desconocido");

      if (isLogin) {
        await signIn({
          token: data.token,
          userId: data.usuario.id.toString(),
          userName: data.usuario.nombre
        });
      } else {
        Alert.alert("Éxito", "Registro exitoso. Ahora inicia sesión.");
        setIsLogin(true);
      }
    } catch (error: any) {
      setLoginError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const rawLogo = width * 0.18;
  const logoSize = Math.min(Math.max(rawLogo, 90), 120);

  const rawTitle = width * 0.07;
  const titleSize = Math.min(Math.max(rawTitle, 40), 50);

  const subtitleSize = Math.min(Math.max(width * 0.032, 15), 20);

  const inputWidth = isLargeScreen ? "100%" : "100%";
  const formMaxWidth = isLargeScreen ? "50%" : "100%";

  const renderLoginRegister = () => (
    <View style={[styles.card, { maxWidth: formMaxWidth }]}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, isLogin && styles.activeTab]}
          onPress={() => setIsLogin(true)}
        >
          <Text style={[styles.tabText, isLogin && styles.activeTabText]}>
            Iniciar sesión
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, !isLogin && styles.activeTab]}
          onPress={() => setIsLogin(false)}
        >
          <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>
            Registrarse
          </Text>
        </TouchableOpacity>
      </View>

      {!isLogin && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre completo</Text>
          <View style={[styles.inputContainer, { width: inputWidth, alignSelf: "center" }]}>
            <FontAwesome name="user" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { fontSize: isLargeScreen ? 18 : 14 }]}
              placeholder="María Rodriguez"
              value={formData.nombre}
              onChangeText={v => handleChange("nombre", v)}
            />
          </View>
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Correo electrónico</Text>
        <View style={[styles.inputContainer, { width: inputWidth, alignSelf: "center" }]}>
          <FontAwesome name="envelope" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { fontSize: isLargeScreen ? 18 : 14 }]}
            placeholder="tu@email.com"
            value={formData.email}
            onChangeText={v => handleChange("email", v)}
            keyboardType="email-address"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Contraseña</Text>
        <View style={[styles.inputContainer, { width: inputWidth, alignSelf: "center" }]}>
          <FontAwesome name="lock" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { fontSize: isLargeScreen ? 18 : 14 }]}
            placeholder="••••••••"
            value={formData.password}
            secureTextEntry={!showPassword}
            onChangeText={v => handleChange("password", v)}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <FontAwesome name={showPassword ? "eye-slash" : "eye"} style={styles.inputIcon} />
          </TouchableOpacity>
        </View>
      </View>

      {loginError ? <Text style={styles.errorText}>{loginError}</Text> : null}

      {/* BOTÓN */}
      <TouchableOpacity
        style={[styles.button, { width: inputWidth, alignSelf: "center" }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>
            {isLogin ? "Iniciar sesión" : "Crear cuenta"}
          </Text>
        )}
      </TouchableOpacity>
      {isLogin && (
        <TouchableOpacity onPress={() => setForgotPasswordStep("request")}>
          <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
      )}

      <View style={[styles.infoBox, { width: inputWidth, alignSelf: "center" }]}>
        <Text style={styles.infoText}>
          ♻️ Únete a nuestra comunidad de{" "}
          <Text style={{ fontWeight: "600" }}>más de 1,000 usuarios</Text>{" "}
          comprometidos con el planeta
        </Text>
      </View>


    </View>
  );

  return (
    <LinearGradient colors={["#10B981", "#059669", "#047857"]} style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, width: "100%" }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <View style={[styles.logoContainer, { width: logoSize, height: logoSize, borderRadius: logoSize / 2 }]}>
              <FontAwesome name="leaf" color="#059669" size={logoSize * 0.6} />
            </View>

            <Text style={[styles.title, { fontSize: titleSize }]}>EcoPoints</Text>
            <Text style={[styles.subtitle, { fontSize: subtitleSize }]}>
              Recicla, gana puntos y cambia el mundo
            </Text>
          </View>

          {forgotPasswordStep === "login" && renderLoginRegister()}

          <Text style={styles.termsText}>
            Al continuar, aceptas nuestros términos y condiciones
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

// ------------------------------------------------
// ------------------ ESTILOS --------------------
// ------------------------------------------------

const { width } = Dimensions.get("window");
const isLargeScreenGlobal = width >= 768;

const styles = StyleSheet.create({
  gradient: { flex: 1 },

  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    alignSelf: "center",
    width:
      Platform.OS === "web" && isLargeScreenGlobal
        ? "60%"
        : isLargeScreenGlobal
          ? "80%"
          : "100%",
  },

  header: { alignItems: "center", marginBottom: 30 },

  logoContainer: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },

  title: { fontWeight: "600", color: "#fff", marginTop: 6 },
  subtitle: { color: "#D1FAE5", marginTop: 4 },

  card: {
    width: isLargeScreenGlobal ? "50%" : "100%",
    backgroundColor: "#000000ff",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    elevation: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#e0e0e0ff",
    borderRadius: 8,
    padding: 4,
    marginBottom: 50,
    width: "100%",
  },

  tab: { flex: 1, paddingVertical: 5, borderRadius: 6 },
  activeTab: { backgroundColor: "white", elevation: 3 },
  tabText: { textAlign: "center", fontSize: 14, color: "#4B5563", fontWeight: "500" },
  activeTabText: { color: "#059669", fontWeight: "700" },

  inputGroup: { width: "100%", marginBottom: 16 },
  label: { fontSize: 15, color: "#ffffff", fontWeight: "500", marginVertical: 10 },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 10,
  },

  input: { flex: 1, height: 35, fontSize: 16 },
  inputIcon: { color: "#9CA3AF", marginHorizontal: 8 },

  errorText: { color: "red", marginTop: 10 },

  button: {
    backgroundColor: "#10B981",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },

  forgotPasswordText: { color: "#059669", marginVertical: 50 },

  termsText: { color: "#A7F3D0", fontSize: 12, marginTop: 20, textAlign: "center" },

  // 🔥 NUEVA CAJA DE INFORMACIÓN
  infoBox: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.35)",
  },

  infoText: {
    color: "#A7F3D0",
    textAlign: "center",
    fontSize: 13,
  },
});
