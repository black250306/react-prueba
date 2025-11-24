import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, Platform } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { FontAwesome } from '@expo/vector-icons';

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

export default function NotificationsScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const [settings, setSettings] = useState({
        pushNotifications: true,
        soundEnabled: true,
        newRewards: true,
        recyclingReminders: false,
        achievements: true,
        emailNotifications: false,
    });

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
            <Section title="Notificaciones Push">
                <SettingRow
                    text="Activar notificaciones"
                    description="Recibe alertas en tu dispositivo"
                    value={settings.pushNotifications}
                    onValueChange={() => toggleSetting('pushNotifications')}
                />
                <View style={[styles.separator, {backgroundColor: Colors[colorScheme].background}]} />
                <SettingRow
                    text="Sonido"
                    description="Reproducir sonido al recibir notificaciones"
                    value={settings.soundEnabled}
                    onValueChange={() => toggleSetting('soundEnabled')}
                />
            </Section>

            <Section title="Tipos de notificaciones">
                <SettingRow
                    text="Nuevas recompensas"
                    description="Cuando hay nuevos premios disponibles"
                    value={settings.newRewards}
                    onValueChange={() => toggleSetting('newRewards')}
                />
                <View style={[styles.separator, {backgroundColor: Colors[colorScheme].background}]} />
                <SettingRow
                    text="Recordatorios de reciclaje"
                    description="Notificaciones semanales para reciclar"
                    value={settings.recyclingReminders}
                    onValueChange={() => toggleSetting('recyclingReminders')}
                />
                <View style={[styles.separator, {backgroundColor: Colors[colorScheme].background}]} />
                 <SettingRow
                    text="Logros desbloqueados"
                    description="Celebra tus nuevos logros"
                    value={settings.achievements}
                    onValueChange={() => toggleSetting('achievements')}
                />
            </Section>

             <Section title="Correo electrónico">
                <SettingRow
                    text="Notificaciones por email"
                    description="Recibe resúmenes por correo"
                    value={settings.emailNotifications}
                    onValueChange={() => toggleSetting('emailNotifications')}
                />
            </Section>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  card: {
    borderRadius: 12,
    paddingHorizontal: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  rowTextContainer: {
      flex: 1,
      paddingRight: 16,
  },
  rowText: {
    fontSize: 16,
  },
  rowDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  separator: {
    height: 1,
    marginHorizontal: -16,
  },
});