import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image, useWindowDimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

const API_BASE = 'https://ecopoints.hvd.lat/api';

interface Reward {
  id: string;
  name: string;
  brand: string;
  points: number;
  category: string;
  image: string;
  stock: number;
}

// ✔ categorías corregidas (todas minúsculas)
const CATEGORIES = ['todos', 'restaurante', 'cafe', 'retail'];

const RewardCard = ({ item, onSelect }: { item: Reward; onSelect: () => void; }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const { width } = useWindowDimensions();
  const cardWidth = (width / 2) - (16 + 8);

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: Colors[colorScheme].background, width: cardWidth }]} onPress={onSelect}>
      <Image source={{ uri: item.image }} style={[styles.cardImage, { height: cardWidth * 0.7 }]} />
      {item.stock <= 0 && <View style={styles.stockOverlay}><Text style={styles.stockText}>Sin Stock</Text></View>}
      <View style={styles.cardContent}>
        <Text style={[styles.cardBrand, { color: Colors[colorScheme].icon, fontSize: width * 0.03 }]}>{item.brand}</Text>
        <Text style={[styles.cardName, { color: Colors[colorScheme].text, fontSize: width * 0.035 }]} numberOfLines={1}>{item.name}</Text>
        <View style={styles.cardPointsContainer}>
          <FontAwesome name="leaf" size={width * 0.035} color="#10B981" />
          <Text style={[styles.cardPoints, { color: Colors[colorScheme].text, fontSize: width * 0.035 }]}>{item.points} pts</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function RewardsScreen() {
  const router = useRouter();
  const { userId, token } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const { width } = useWindowDimensions();

  const [rewards, setRewards] = useState<Reward[]>([]);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  // ✔ categoría inicial correcta
  const [activeCategory, setActiveCategory] = useState('todos');

  const getAuthHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  }), [token]);

  const fetchData = useCallback(async () => {
    if (!userId) return setLoading(false);
    setLoading(true);

    try {
      const pointsPromise = fetch(`${API_BASE}/obtenerPuntos?usuario_id=${userId}`, { headers: getAuthHeaders() });
      const rewardsPromise = fetch(`${API_BASE}/listarConvenios`, { headers: getAuthHeaders() });

      const [pointsRes, rewardsRes] = await Promise.all([pointsPromise, rewardsPromise]);

      if (pointsRes.ok) setPoints((await pointsRes.json()).puntos || 0);

      if (rewardsRes.ok) {
        const rewardsData = await rewardsRes.json();

        setRewards(rewardsData.map((item: any) => ({
          id: item.id.toString(),
          name: item.titulo || 'Convenio',
          brand: item.empresa || 'Empresa',

          points: parseInt(item.puntos_requeridos) || 0,

          // ✔ categorías unificadas
          category:
            (item.empresa || '').toLowerCase().includes('rest')
              ? 'restaurante'
              : (item.empresa || '').toLowerCase().includes('cafe')
              ? 'cafe'
              : 'retail',

          image: item.imagen_url || 'https://via.placeholder.com/150',
          stock: parseInt(item.stock) || 0,
        })));
      }
    } catch (error) {
      console.error("Failed to load rewards", error);
    } finally {
      setLoading(false);
    }
  }, [userId, token, getAuthHeaders]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelectReward = (reward: Reward) => {
    if (reward.stock <= 0) return Alert.alert("Agotado", "Este premio ya no está disponible.");
    if (points < reward.points) return Alert.alert("Puntos insuficientes", "No tienes suficientes puntos.");
    router.push({ pathname: "/redeem-confirm", params: { ...reward } });
  };

  // ✔ filtro funcionando correctamente
  const filteredRewards = activeCategory === 'todos'
    ? rewards
    : rewards.filter(r => r.category === activeCategory);

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <FlatList
        data={filteredRewards}
        renderItem={({ item }) => <RewardCard item={item} onSelect={() => handleSelectReward(item)} />}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <LinearGradient colors={['#10B981', '#059669']} style={[styles.header, { paddingTop: 60 }]}>
              <Text style={[styles.headerTitle, { fontSize: width * 0.08 }]}>Premios</Text>
              <Text style={[styles.headerSubtitle, { fontSize: width * 0.04 }]}>Tus Ecopoints</Text>
              <Text style={[styles.pointsDisplay, { fontSize: width * 0.1 }]}>{points.toLocaleString()}</Text>
            </LinearGradient>

            <View style={[styles.filterContainer, { backgroundColor: Colors[colorScheme].background }]}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.filterButton, activeCategory === cat && styles.activeFilter]}
                  onPress={() => setActiveCategory(cat)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      { color: Colors[colorScheme].icon, fontSize: width * 0.035 },
                      activeCategory === cat && styles.activeFilterText
                    ]}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        }
        ListEmptyComponent={
          loading
            ? <ActivityIndicator size="large" style={{ marginTop: 50 }} />
            : <Text style={[styles.emptyText, { color: Colors[colorScheme].icon }]}>No hay premios disponibles.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: { padding: 24, alignItems: 'center' },
  headerTitle: { fontWeight: 'bold', color: 'white', marginBottom: 16 },
  headerSubtitle: { color: 'rgba(255,255,255,0.8)' },
  pointsDisplay: { fontWeight: 'bold', color: 'white' },

  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    marginHorizontal: 16,
    borderRadius: 12,
    marginTop: -20,
    elevation: 5
  },

  filterButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  activeFilter: { backgroundColor: '#10B981' },
  filterText: { fontWeight: '600' },
  activeFilterText: { color: 'white' },

  listContent: { paddingHorizontal: 8 },
  emptyText: { textAlign: 'center', marginTop: 50 },

  card: {
    borderRadius: 12,
    margin: 8,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardImage: { width: '100%' },
  cardContent: { padding: 12 },
  cardBrand: {},
  cardName: { fontWeight: 'bold', marginVertical: 4 },
  cardPointsContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  cardPoints: { marginLeft: 4, fontWeight: '600' },

  stockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  stockText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
