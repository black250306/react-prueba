import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

const API_BASE = 'https://ecopoints.hvd.lat/api';

const niveles = [
    { nivel: 1, escaneosRequeridos: 0, nombre: "Eco Novice" },
    { nivel: 2, escaneosRequeridos: 10, nombre: "Eco Warrior" },
    { nivel: 3, escaneosRequeridos: 50, nombre: "Eco Hero" },
    { nivel: 4, escaneosRequeridos: 100, nombre: "Eco Champion" },
    { nivel: 5, escaneosRequeridos: 500, nombre: "Eco Master" },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { userName, signOut, token, userId } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';

  const [points, setPoints] = useState(0);
  const [totalScans, setTotalScans] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // ... (data fetching logic remains the same)

  const handleLogout = () => {
    signOut();
  };

  const nivelActual = niveles.slice().reverse().find(n => totalScans >= n.escaneosRequeridos) || niveles[0];
  const siguienteNivel = niveles.find(n => n.nivel === nivelActual.nivel + 1);
  const progreso = siguienteNivel ? (totalScans - nivelActual.escaneosRequeridos) / (siguienteNivel.escaneosRequeridos - nivelActual.escaneosRequeridos) * 100 : 100;
  
  // Responsive Sizes
  const avatarSize = width * 0.25;
  const statIconSize = width * 0.07;
  const menuIconSize = width * 0.055;

  const Stat = ({ icon, label, value }: { icon: any; label: string; value: string | number }) => (
    <View style={styles.stat}>
      <FontAwesome name={icon} size={statIconSize} color={Colors.light.tint}/>
      <Text style={[styles.statValue, { color: Colors[colorScheme].text, fontSize: width * 0.045 }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: Colors[colorScheme].icon, fontSize: width * 0.035 }]}>{label}</Text>
    </View>
  );

  const MenuButton = ({ icon, label, onPress, isDestructive = false }: { icon: any; label: string; onPress: () => void; isDestructive?: boolean }) => (
    <TouchableOpacity style={styles.menuButton} onPress={onPress}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <FontAwesome name={icon} size={menuIconSize} style={[styles.menuIcon, {color: isDestructive ? Colors.light.tint : Colors[colorScheme].icon}]}/>
            <Text style={[styles.menuLabel, { color: isDestructive ? Colors.light.tint : Colors[colorScheme].text, fontSize: width * 0.04 }]}>{label}</Text>
        </View>
        {!isDestructive && <FontAwesome name="chevron-right" size={16} style={[styles.menuChevron, {color: Colors[colorScheme].icon}]}/>}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <View style={[styles.header, { backgroundColor: Colors[colorScheme].background }]}>
        <View style={[styles.avatar, {width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2}]}>
          <FontAwesome name="user" size={avatarSize * 0.5} color={Colors.light.tint} />
        </View>
        <Text style={[styles.userName, { color: Colors[colorScheme].text, fontSize: width * 0.06 }]}>{userName}</Text>
        <Text style={[styles.email, { color: Colors[colorScheme].icon, fontSize: width * 0.04 }]}>{`Nivel ${nivelActual.nivel} - ${nivelActual.nombre}`}</Text>
      </View>

      <View style={[styles.statsContainer, { backgroundColor: Colors[colorScheme].background, borderTopColor: Colors[colorScheme].icon, borderBottomColor: Colors[colorScheme].icon }]}>
          <Stat icon="leaf" label="Puntos" value={isLoading ? '...' : points} />
          <Stat icon="qrcode" label="Escaneos" value={isLoading ? '...' : totalScans} />
          <Stat icon="trophy" label="Nivel" value={isLoading ? '...' : nivelActual.nivel} />
      </View>

      <View style={[styles.levelCard, { backgroundColor: Colors[colorScheme].background }]}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8}}>
            <Text style={[styles.levelText, { color: Colors[colorScheme].text, fontSize: width * 0.035 }]}>Próximo nivel</Text>
            <Text style={[styles.levelText, { color: Colors[colorScheme].text, fontSize: width * 0.035 }]}>{siguienteNivel ? `Faltan ${siguienteNivel.escaneosRequeridos - totalScans}` : 'Nivel Máximo'}</Text>
        </View>
        <View style={[styles.progressBarBackground, {backgroundColor: Colors[colorScheme].icon}]}>
          <View style={[styles.progressBar, { width: `${progreso}%` }]} />
        </View>
      </View>

      <View style={[styles.menuContainer, { backgroundColor: Colors[colorScheme].background }]}>
          <MenuButton icon="cog" label="Configuración" onPress={() => router.push('/settings')} />
          <MenuButton icon="bell" label="Notificaciones" onPress={() => router.push('/notifications')} />
          <MenuButton icon="shield" label="Privacidad y seguridad" onPress={() => router.push('/privacy')} />
          <MenuButton icon="question-circle" label="Ayuda y soporte" onPress={() => router.push('/help')} />
          <View style={[styles.separator, {backgroundColor: Colors[colorScheme].background}]} />
          <MenuButton icon="sign-out" label="Cerrar sesión" onPress={handleLogout} isDestructive />
      </View>
      
      <Text style={[styles.footerText, {color: Colors[colorScheme].icon}]}>EcoPoints v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', padding: 24 },
  avatar: { backgroundColor: '#E0F2F1', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  userName: { fontWeight: 'bold' },
  email: { marginTop: 4 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 20, borderTopWidth: 1, borderBottomWidth: 1 },
  stat: { alignItems: 'center' },
  statValue: { fontWeight: 'bold', marginTop: 8 },
  statLabel: { marginTop: 4 },
  levelCard: { margin: 16, padding: 16, borderRadius: 12 },
  levelText: {},
  progressBarBackground: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#10B981', borderRadius: 4 },
  menuContainer: { marginTop: 8 },
  menuButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 24 },
  menuIcon: { width: 25 },
  menuLabel: { marginLeft: 16 },
  menuChevron: {},
  separator: { height: 1, marginHorizontal: 24, marginVertical: 8 },
  destructiveText: { color: Colors.light.tint },
  footerText: { textAlign: 'center', marginVertical: 24, fontSize: 12 }
});