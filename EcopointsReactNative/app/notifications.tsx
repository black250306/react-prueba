import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, Platform } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { FontAwesome } from '@expo/vector-icons';

const SettingRow = ({ text, description, value, onValueChange, isFirst = false, isLast = false }: { text: string, description?: string, value: boolean, onValueChange: (value: boolean) => void, isFirst?: boolean, isLast?: boolean }) => {
    const colorScheme = useColorScheme() ?? 'light';
    return (
        <View style={[styles.row, isFirst && {paddingTop: 16}, isLast && {paddingBottom: 16}]}>
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

const Section = ({ title, children, footer }: { title: string, children: React.ReactNode, footer?: React.ReactNode }) => {
    const colorScheme = useColorScheme() ?? 'light';
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}>{title}</Text>
        <View style={[styles.card, { backgroundColor: Colors[colorScheme].background, shadowColor: Colors[colorScheme].text }]}>
          {children}
        </View>
        {footer}
      </View>
    );
};

export default function NotificationsScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const [settings, setSettings] = useState({
        newRewards: true,
        recyclingReminders: true,
        achievements: true,
        promotions: false,
        weeklyReport: true,
        emailNotifications: true,
        pushNotifications: true,
        soundEnabled: true
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
                    isFirst
                />
                <View style={[styles.separator, {backgroundColor: Colors[colorScheme].background + '80'}]} />
                <SettingRow
                    text="Sonido"
                    description="Reproducir sonido al recibir notificaciones"
                    value={settings.soundEnabled}
                    onValueChange={() => toggleSetting('soundEnabled')}
                    isLast
                />
            </Section>

            <Section title="Tipos de notificaciones">
                <SettingRow text="Nuevas recompensas" description="Cuando hay nuevos premios disponibles" value={settings.newRewards} onValueChange={() => toggleSetting('newRewards')} isFirst />
                <View style={[styles.separator, {backgroundColor: Colors[colorScheme].background + '80'}]} />
                <SettingRow text="Recordatorios de reciclaje" description="Notificaciones semanales para reciclar" value={settings.recyclingReminders} onValueChange={() => toggleSetting('recyclingReminders')} />
                <View style={[styles.separator, {backgroundColor: Colors[colorScheme].background + '80'}]} />
                <SettingRow text="Logros desbloqueados" description="Celebra tus nuevos logros" value={settings.achievements} onValueChange={() => toggleSetting('achievements')} />
                <View style={[styles.separator, {backgroundColor: Colors[colorScheme].background + '80'}]} />
                <SettingRow text="Promociones" description="Ofertas especiales y descuentos" value={settings.promotions} onValueChange={() => toggleSetting('promotions')} />
                <View style={[styles.separator, {backgroundColor: Colors[colorScheme].background + '80'}]} />
                <SettingRow text="Reporte semanal" description="Resumen de tu actividad ecológica" value={settings.weeklyReport} onValueChange={() => toggleSetting('weeklyReport')} isLast />
            </Section>

             <Section title="Correo electrónico">
                <SettingRow
                    text="Notificaciones por email"
                    description="Recibe resúmenes por correo"
                    value={settings.emailNotifications}
                    onValueChange={() => toggleSetting('emailNotifications')}
                    isFirst isLast
                />
            </Section>
            
            <View style={[styles.infoCard, {backgroundColor: '#E0F2F1'}]}>
                <FontAwesome name="info-circle" size={20} color={Colors.light.tint} />
                <Text style={[styles.infoText, {color: Colors.light.tint}]}>
                    Las notificaciones te ayudan a mantener tus hábitos de reciclaje y no perderte ninguna recompensa.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 12,
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
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    overflow: 'hidden'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
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
    height: StyleSheet.hairlineWidth,
    marginHorizontal: -16,
  },
  infoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      padding: 16,
      margin: 16,
  },
  infoText: {
      flex: 1,
      marginLeft: 12,
      fontSize: 14,
      lineHeight: 20
  }
});