import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';

const API_BASE = 'https://ecopoints.hvd.lat/api';

const SettingRow = ({ text, description, value, onValueChange, isFirst = false, isLast = false }: { text: string, description?: string, value: boolean, onValueChange: (value: boolean) => void, isFirst?: boolean, isLast?: boolean }) => {
    const colorScheme = useColorScheme() ?? 'light';
    const rowStyles = [styles.row, isFirst && { paddingTop: 16 }, isLast && { paddingBottom: 16 }];
    return (
        <View style={rowStyles}>
            <View style={styles.rowTextContainer}>
                <Text style={[styles.rowText, { color: Colors[colorScheme].text }]}>{text}</Text>
                {description && <Text style={[styles.rowDescription, { color: Colors[colorScheme].icon }]}>{description}</Text>}
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: '#767577', true: Colors.light.tint }}
                thumbColor={value ? Colors.dark.tint : '#f4f3f4'}
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

const ActionButton = ({ text, icon, onPress, isDestructive = false }: { text: string, icon: any, onPress: () => void, isDestructive?: boolean}) => {
    const colorScheme = useColorScheme() ?? 'light';
    return (
        <TouchableOpacity style={styles.actionRow} onPress={onPress}>
            <FontAwesome name={icon} size={20} style={[styles.rowIcon, {color: isDestructive ? Colors.light.error : Colors[colorScheme].icon}]} />
            <View style={styles.rowTextContainer}>
                <Text style={[styles.rowText, { color: isDestructive ? Colors.light.error : Colors[colorScheme].text }]}>{text}</Text>
            </View>
            <FontAwesome name={"chevron-right"} size={16} color={Colors[colorScheme].icon}/>
        </TouchableOpacity>
    );
}

export default function PrivacyScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const { userId, token } = useAuth();

    const [showChangePassword, setShowChangePassword] = useState(false);
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
    const [passwordVisibility, setPasswordVisibility] = useState({ current: false, new: false, confirm: false });
    const [isLoading, setIsLoading] = useState(false);

    const [privacySettings, setPrivacySettings] = useState({
        twoFactorAuth: false,
        profilePublic: true,
        shareStats: true,
        showInLeaderboard: true,
        location: true,
        dataCollection: true
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
        if (passwordData.new === passwordData.current) {
            return Alert.alert('Error', 'La nueva contraseña debe ser diferente a la actual');
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
                 if (data.error && data.error.includes('incorrecta')) {
                    Alert.alert('Error', 'La contraseña actual es incorrecta');
                } else {
                    Alert.alert('Error', data.error || 'Error al cambiar la contraseña');
                }
            }
        } catch (error: any) {
            Alert.alert('Error', 'Error de conexión. Intenta nuevamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
            <Section title="Seguridad de cuenta">
                 <TouchableOpacity style={[styles.row, {paddingVertical: 16}]} onPress={() => setShowChangePassword(!showChangePassword)}>
                    <FontAwesome name="key" size={20} color={Colors[colorScheme].icon} style={styles.rowIcon} />
                    <View style={styles.rowTextContainer}>
                        <Text style={[styles.rowText, { color: Colors[colorScheme].text }]}>Cambiar contraseña</Text>
                    </View>
                    <FontAwesome name={showChangePassword ? "chevron-down" : "chevron-right"} size={16} color={Colors[colorScheme].icon}/>
                </TouchableOpacity>

                {showChangePassword && (
                    <View style={styles.passwordForm}>
                        <Text style={[styles.label, {color: Colors[colorScheme].text}]}>Contraseña actual</Text>
                        <View style={[styles.inputContainer, {borderColor: Colors[colorScheme].icon}]}>
                            <TextInput style={[styles.input, {color: Colors[colorScheme].text}]} placeholder="Ingresa tu contraseña actual" placeholderTextColor={Colors[colorScheme].icon} secureTextEntry={!passwordVisibility.current} value={passwordData.current} onChangeText={(text) => setPasswordData(prev => ({ ...prev, current: text }))}/>
                             <TouchableOpacity onPress={() => setPasswordVisibility(prev => ({...prev, current: !prev.current}))}><FontAwesome name={passwordVisibility.current ? "eye-slash" : "eye"} size={16} color={Colors[colorScheme].icon} /></TouchableOpacity>
                        </View>
                        
                        <Text style={[styles.label, {color: Colors[colorScheme].text}]}>Nueva contraseña</Text>
                        <View style={[styles.inputContainer, {borderColor: Colors[colorScheme].icon}]}>
                            <TextInput style={[styles.input, {color: Colors[colorScheme].text}]} placeholder="Mínimo 6 caracteres" placeholderTextColor={Colors[colorScheme].icon} secureTextEntry={!passwordVisibility.new} value={passwordData.new} onChangeText={(text) => setPasswordData(prev => ({ ...prev, new: text }))}/>
                            <TouchableOpacity onPress={() => setPasswordVisibility(prev => ({...prev, new: !prev.new}))}><FontAwesome name={passwordVisibility.new ? "eye-slash" : "eye"} size={16} color={Colors[colorScheme].icon} /></TouchableOpacity>
                        </View>

                        <Text style={[styles.label, {color: Colors[colorScheme].text}]}>Confirmar contraseña</Text>
                         <View style={[styles.inputContainer, {borderColor: Colors[colorScheme].icon}]}>
                            <TextInput style={[styles.input, {color: Colors[colorScheme].text}]} placeholder="Repite tu nueva contraseña" placeholderTextColor={Colors[colorScheme].icon} secureTextEntry={!passwordVisibility.confirm} value={passwordData.confirm} onChangeText={(text) => setPasswordData(prev => ({ ...prev, confirm: text }))}/>
                            <TouchableOpacity onPress={() => setPasswordVisibility(prev => ({...prev, confirm: !prev.confirm}))}><FontAwesome name={passwordVisibility.confirm ? "eye-slash" : "eye"} size={16} color={Colors[colorScheme].icon} /></TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.button} onPress={handlePasswordChange} disabled={isLoading}>
                            {isLoading ? <ActivityIndicator color="white"/> : <Text style={styles.buttonText}>Actualizar Contraseña</Text>}
                        </TouchableOpacity>
                    </View>
                )}
                 <View style={[styles.separator, {backgroundColor: Colors[colorScheme].background + '80'}]} />
                 <SettingRow text="Autenticación de dos factores" description="Mayor seguridad para tu cuenta" value={privacySettings.twoFactorAuth} onValueChange={() => togglePrivacySetting('twoFactorAuth')} isLast/>
            </Section>

            <Section title="Privacidad de datos">
                <SettingRow text="Perfil público" description="Otros usuarios pueden ver tu perfil" value={privacySettings.profilePublic} onValueChange={() => togglePrivacySetting('profilePublic')} isFirst/>
                <View style={[styles.separator, {backgroundColor: Colors[colorScheme].background + '80'}]} />
                <SettingRow text="Compartir estadísticas" description="Visible en el ranking global" value={privacySettings.shareStats} onValueChange={() => togglePrivacySetting('shareStats')} />
                <View style={[styles.separator, {backgroundColor: Colors[colorScheme].background + '80'}]} />
                <SettingRow text="Mostrar en leaderboard" description="Aparecer en tablas de posiciones" value={privacySettings.showInLeaderboard} onValueChange={() => togglePrivacySetting('showInLeaderboard')} />
                <View style={[styles.separator, {backgroundColor: Colors[colorScheme].background + '80'}]} />
                <SettingRow text="Ubicación" description="Para encontrar estaciones cercanas" value={privacySettings.location} onValueChange={() => togglePrivacySetting('location')} />
                <View style={[styles.separator, {backgroundColor: Colors[colorScheme].background + '80'}]} />
                <SettingRow text="Recopilación de datos" description="Para mejorar la experiencia" value={privacySettings.dataCollection} onValueChange={() => togglePrivacySetting('dataCollection')} isLast/>
            </Section>

            <Section title="Gestión de datos">
                <ActionButton text="Descargar mis datos" icon="download" onPress={() => Alert.alert('Descargar datos', 'Esta función estará disponible pronto.')} />
                <View style={[styles.separator, {backgroundColor: Colors[colorScheme].background + '80'}]} />
                <ActionButton text="Eliminar mi cuenta" icon="trash" onPress={() => Alert.alert('Eliminar cuenta', 'Para eliminar tu cuenta, por favor contacta a soporte.', [{text: 'OK'}])} isDestructive/>
            </Section>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, paddingHorizontal: 8 },
  card: { borderRadius: 12, elevation: 1, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 16 },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16 },
  rowIcon: { marginRight: 16 },
  rowTextContainer: { flex: 1, paddingRight: 16 },
  rowText: { fontSize: 16 },
  rowDescription: { fontSize: 14, marginTop: 2 },
  separator: { height: StyleSheet.hairlineWidth, marginHorizontal: -16 },
  passwordForm: { borderTopWidth: StyleSheet.hairlineWidth, marginHorizontal:-16, paddingHorizontal: 16, borderColor: '#ccc', marginTop: 10, paddingTop: 16, paddingBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8, marginLeft: 4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, marginBottom: 16 },
  input: { flex: 1, height: 48, fontSize: 16 },
  button: { backgroundColor: Colors.light.tint, paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});