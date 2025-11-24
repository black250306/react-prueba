import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';

const API_BASE = 'https://ecopoints.hvd.lat/api';

const SettingRow = ({ text, description, value, onValueChange }: { text: string, description: string, value: boolean, onValueChange: (value: boolean) => void }) => {
    const colorScheme = useColorScheme() ?? 'light';
    return (
        <View style={styles.row}>
            <View style={styles.rowTextContainer}>
                <Text style={[styles.rowText, { color: Colors[colorScheme].text }]}>{text}</Text>
                {description && <Text style={[styles.rowDescription, { color: Colors[colorScheme].icon }]}>{description}</Text>}
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                thumbColor={Platform.OS === 'android' ? Colors[colorScheme].background : undefined}
            />
        </View>
    );
};

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => {
    const colorScheme = useColorScheme() ?? 'light';
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}>{title}</Text>
        <View style={[styles.card, { backgroundColor: Colors[colorScheme].background, shadowColor: Colors[colorScheme].text }]}>
          {children}
        </View>
      </View>
    );
};

export default function PrivacyScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const { userId, token } = useAuth();

    const [showChangePassword, setShowChangePassword] = useState(false);
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
    const [passwordVisibility, setPasswordVisibility] = useState({ current: false, new: false, confirm: false });
    const [isLoading, setIsLoading] = useState(false);

    const [privacySettings, setPrivacySettings] = useState({
        profilePublic: true,
        shareStats: true,
    });

    const togglePrivacySetting = (key: keyof typeof privacySettings) => {
        setPrivacySettings(prev => ({ ...prev, [key]: !prev[key] }));
    };
    
    const handlePasswordChange = async () => {
        if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
            return Alert.alert('Error', 'Todos los campos son obligatorios');
        }
        if (passwordData.new !== passwordData.confirm) {
            return Alert.alert('Error', 'Las nuevas contraseñas no coinciden');
        }
        if (passwordData.new.length < 6) {
            return Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE}/actualizarContrasena`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    usuario_id: userId,
                    contrasena_actual: passwordData.current,
                    nueva_contrasena: passwordData.new
                })
            });

            const data = await response.json();
            if (response.ok) {
                Alert.alert('Éxito', data.mensaje || 'Contraseña actualizada correctamente');
                setShowChangePassword(false);
                setPasswordData({ current: '', new: '', confirm: '' });
            } else {
                throw new Error(data.error || 'Error al cambiar la contraseña');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <ScrollView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
            <Section title="Seguridad de cuenta">
                 <TouchableOpacity style={styles.row} onPress={() => setShowChangePassword(!showChangePassword)}>
                    <FontAwesome name="key" size={20} color={Colors[colorScheme].icon} style={styles.rowIcon} />
                    <View style={styles.rowTextContainer}>
                        <Text style={[styles.rowText, { color: Colors[colorScheme].text }]}>Cambiar contraseña</Text>
                    </View>
                    <FontAwesome name={showChangePassword ? "chevron-down" : "chevron-right"} size={16} color={Colors[colorScheme].icon}/>
                </TouchableOpacity>

                {showChangePassword && (
                    <View style={styles.passwordForm}>
                        {/* Current Password */}
                        <Text style={[styles.label, {color: Colors[colorScheme].text}]}>Contraseña actual</Text>
                        <View style={[styles.inputContainer, {borderColor: Colors[colorScheme].icon}]}>
                            <TextInput
                                style={[styles.input, {color: Colors[colorScheme].text}]}
                                placeholder="Ingresa tu contraseña actual"
                                placeholderTextColor={Colors[colorScheme].icon}
                                secureTextEntry={!passwordVisibility.current}
                                value={passwordData.current}
                                onChangeText={(text) => setPasswordData(prev => ({ ...prev, current: text }))}
                            />
                             <TouchableOpacity onPress={() => setPasswordVisibility(prev => ({...prev, current: !prev.current}))}>
                                <FontAwesome name={passwordVisibility.current ? "eye-slash" : "eye"} size={16} color={Colors[colorScheme].icon} />
                            </TouchableOpacity>
                        </View>
                        
                        {/* New Password */}
                        <Text style={[styles.label, {color: Colors[colorScheme].text}]}>Nueva contraseña</Text>
                        <View style={[styles.inputContainer, {borderColor: Colors[colorScheme].icon}]}>
                            <TextInput
                                style={[styles.input, {color: Colors[colorScheme].text}]}
                                placeholder="Mínimo 6 caracteres"
                                placeholderTextColor={Colors[colorScheme].icon}
                                secureTextEntry={!passwordVisibility.new}
                                value={passwordData.new}
                                onChangeText={(text) => setPasswordData(prev => ({ ...prev, new: text }))}
                            />
                            <TouchableOpacity onPress={() => setPasswordVisibility(prev => ({...prev, new: !prev.new}))}>
                                <FontAwesome name={passwordVisibility.new ? "eye-slash" : "eye"} size={16} color={Colors[colorScheme].icon} />
                            </TouchableOpacity>
                        </View>

                        {/* Confirm Password */}
                        <Text style={[styles.label, {color: Colors[colorScheme].text}]}>Confirmar contraseña</Text>
                         <View style={[styles.inputContainer, {borderColor: Colors[colorScheme].icon}]}>
                            <TextInput
                                style={[styles.input, {color: Colors[colorScheme].text}]}
                                placeholder="Repite tu nueva contraseña"
                                placeholderTextColor={Colors[colorScheme].icon}
                                secureTextEntry={!passwordVisibility.confirm}
                                value={passwordData.confirm}
                                onChangeText={(text) => setPasswordData(prev => ({ ...prev, confirm: text }))}
                            />
                            <TouchableOpacity onPress={() => setPasswordVisibility(prev => ({...prev, confirm: !prev.confirm}))}>
                                <FontAwesome name={passwordVisibility.confirm ? "eye-slash" : "eye"} size={16} color={Colors[colorScheme].icon} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.button} onPress={handlePasswordChange} disabled={isLoading}>
                            {isLoading ? <ActivityIndicator color="white"/> : <Text style={styles.buttonText}>Actualizar Contraseña</Text>}
                        </TouchableOpacity>
                    </View>
                )}
            </Section>

            <Section title="Privacidad de datos">
                <SettingRow
                    text="Perfil público"
                    description="Otros usuarios pueden ver tu perfil"
                    value={privacySettings.profilePublic}
                    onValueChange={() => togglePrivacySetting('profilePublic')}
                />
                 <View style={[styles.separator, {backgroundColor: Colors[colorScheme].background}]} />
                <SettingRow
                    text="Compartir estadísticas"
                    description="Visible en el ranking global"
                    value={privacySettings.shareStats}
                    onValueChange={() => togglePrivacySetting('shareStats')}
                />
            </Section>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, paddingHorizontal: 8 },
  card: { borderRadius: 12, elevation: 2, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16 },
  rowIcon: { marginRight: 16 },
  rowTextContainer: { flex: 1, paddingRight: 16 },
  rowText: { fontSize: 16 },
  rowDescription: { fontSize: 14, marginTop: 2 },
  separator: { height: 1, marginHorizontal: -16 },
  passwordForm: { borderTopWidth: 1, borderColor: '#eee', marginTop: 10, paddingTop: 16, paddingHorizontal: 16, paddingBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 6 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, marginBottom: 12 },
  input: { flex: 1, height: 44, fontSize: 16 },
  button: { backgroundColor: '#10B981', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});