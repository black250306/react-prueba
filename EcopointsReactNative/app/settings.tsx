import React from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

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

const SettingRow = ({ icon, text, description, control }: { icon: any, text: string, description: string, control: React.ReactNode }) => {
    const colorScheme = useColorScheme() ?? 'light';
    return (
        <View style={styles.row}>
            <FontAwesome name={icon} size={20} color={Colors[colorScheme].icon} style={styles.rowIcon} />
            <View style={styles.rowTextContainer}>
                <Text style={[styles.rowText, { color: Colors[colorScheme].text }]}>{text}</Text>
                <Text style={[styles.rowDescription, { color: Colors[colorScheme].icon }]}>{description}</Text>
            </View>
            {control}
        </View>
    );
};

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  const colorScheme = useColorScheme() ?? 'light';
  const isDarkMode = theme === 'dark';

  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <Section title="Apariencia">
        <SettingRow
          icon={isDarkMode ? "moon-o" : "sun-o"}
          text="Modo Oscuro"
          description={"Ahorra batería y reduce el brillo"}
          control={
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: Colors.light.tint }}
              thumbColor={isDarkMode ? Colors.dark.tint : '#f4f3f4'}
            />
          }
        />
      </Section>
      
      <Section title="Acerca de">
        <View style={styles.aboutContainer}>
            <Text style={[styles.aboutText, {color: Colors[colorScheme].icon}]}>Versión 1.0.0</Text>
            <Text style={[styles.aboutText, {color: Colors[colorScheme].icon}]}>© 2025 EcoPoints</Text>
            <Text style={[styles.aboutText, {color: Colors[colorScheme].icon, marginTop: 16}]}>
                Una aplicación para incentivar el reciclaje y cuidar nuestro planeta.
            </Text>
        </View>
      </Section>
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowIcon: {
      marginRight: 16,
  },
  rowTextContainer: {
      flex: 1,
  },
  rowText: {
    fontSize: 16,
  },
  rowDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  aboutContainer: {
    padding: 8,
  },
  aboutText: {
    fontSize: 14,
  }
});
