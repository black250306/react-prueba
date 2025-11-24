import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface Transaction {
  id: number;
  type: "scan" | "redeem";
  description: string;
  location: string;
  points: number;
  date: string;
}

const API_BASE = 'https://ecopoints.hvd.lat/api';
const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const { userId, userName, token } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';

  const [points, setPoints] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getAuthHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  }), [token]);

  const fetchData = useCallback(async () => {
    if (!userId || !token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const pointsPromise = fetch(`${API_BASE}/obtenerPuntos?usuario_id=${userId}`, { headers: getAuthHeaders() });
      const historyPromise = fetch(`${API_BASE}/obtenerHistorial?usuario_id=${userId}`, { headers: getAuthHeaders() });
      const [pointsRes, historyRes] = await Promise.all([pointsPromise, historyPromise]);

      if (pointsRes.ok) {
        const pointsData = await pointsRes.json();
        setPoints(pointsData.puntos || 0);
      }

      if (historyRes.ok) {
        const historyData = await historyRes.json();
        const sortedTransactions = historyData.sort((a: Transaction, b: Transaction) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setRecentTransactions(sortedTransactions);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, token, getAuthHeaders]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const renderTransaction = (transaction: Transaction) => (
    <View key={transaction.id} style={[styles.transactionCard, { backgroundColor: Colors[colorScheme].background, shadowColor: Colors[colorScheme].text }]}>
      <View style={[
        styles.transactionIconContainer,
        { backgroundColor: transaction.type === 'scan' ? '#E0F2F1' : '#FFF7ED' }
      ]}>
        <FontAwesome
          name={transaction.type === 'scan' ? 'leaf' : 'gift'}
          size={20}
          color={transaction.type === 'scan' ? '#10B981' : '#F97316'}
        />
      </View>

      <View style={styles.transactionDetails}>
        <Text style={[styles.transactionDescription, { color: Colors[colorScheme].text }]}>
          {transaction.description}
        </Text>
        <Text style={[styles.transactionLocation, { color: Colors[colorScheme].icon }]}>
          {transaction.location}
        </Text>
      </View>

      <View style={styles.transactionPointsContainer}>
        <Text style={[
          styles.transactionPoints,
          transaction.type === 'scan' ? styles.pointsGained : styles.pointsLost
        ]}>
          {transaction.type === 'scan' ? '+' : '-'}{transaction.points}
        </Text>
        <Text style={[styles.transactionDate, { color: Colors[colorScheme].icon }]}>
          {new Date(transaction.date.replace(" ", "T")).toLocaleDateString("es-PE", {
            day: "numeric",
            month: "short"
          })}
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
      }
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola,</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>
        <View style={styles.headerIcon}>
          <FontAwesome name="leaf" size={30} color="#fff" />
        </View>
      </View>

      {/* BALANCE CARD */}
      <LinearGradient
        colors={['#10B981', '#059669']}
        style={[styles.balanceCard, { marginTop: 16 }]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', opacity: 0.8 }}>
          <FontAwesome name="leaf" size={16} color="#A7F3D0" />
          <Text style={styles.balanceTitle}>Balance disponible</Text>
        </View>

        <View style={styles.balanceAmountContainer}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.balanceAmount}>{points.toLocaleString()}</Text>
              <Text style={styles.balanceUnit}>ecopoints</Text>
            </>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cardButtonPrimary} onPress={() => router.push('/rewards')}>
            <FontAwesome name="gift" size={16} color="#059669" style={{ marginRight: 8 }} />
            <Text style={styles.cardButtonPrimaryText}>Canjear</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cardButtonSecondary} onPress={() => router.push('/rewards')}>
            <Text style={styles.cardButtonSecondaryText}>Ver premios</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* ACTIVITY */}
      <View style={styles.activitySection}>
        <View style={styles.activityHeader}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}>
            Actividad reciente
          </Text>
          <TouchableOpacity onPress={() => router.push('/history')}>
            <Text style={styles.seeAllText}>Ver todo</Text>
          </TouchableOpacity>
        </View>

        {loading && recentTransactions.length === 0 ? (
          <ActivityIndicator style={{ marginTop: 20 }} />
        ) : (
          recentTransactions.slice(0, 4).map(renderTransaction)
        )}
      </View>
    </ScrollView>
  );
}

/* ------------------------- RESPONSIVE STYLES ------------------------- */

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.06,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#059669',
  },
  greeting: {
    color: '#D1FAE5',
    fontSize: width * 0.04,
  },
  userName: {
    color: 'white',
    fontSize: width * 0.065,
    fontWeight: 'bold',
  },
  headerIcon: {
    width: width * 0.14,
    height: width * 0.14,
    borderRadius: width * 0.07,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft:-50
  },

  balanceCard: {
    marginHorizontal: width * 0.06,
    borderRadius: 16,
    paddingVertical: width * 0.07,
    paddingHorizontal: width * 0.05,
    elevation: 8,
  },
  balanceTitle: {
    color: '#A7F3D0',
    marginLeft: 8,
    fontSize: width * 0.038,
  },
  balanceAmountContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 8,
    marginBottom: 16,
  },
  balanceAmount: {
    fontSize: width * 0.09,
    fontWeight: 'bold',
    color: 'white',
  },
  balanceUnit: {
    fontSize: width * 0.045,
    color: '#A7F3D0',
    marginLeft: 8,
    paddingBottom: 4,
  },

  buttonContainer: { flexDirection: 'row', gap: 12 },

  cardButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: width * 0.03,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardButtonPrimaryText: {
    color: '#059669',
    fontWeight: 'bold',
    fontSize: width * 0.04,
  },
  cardButtonSecondary: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    paddingVertical: width * 0.03,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardButtonSecondaryText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: width * 0.04,
  },

  activitySection: {
    paddingHorizontal: width * 0.06,
    paddingBottom: 24,
    marginTop: 16,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: width * 0.048,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: '#059669',
    fontWeight: '600',
    fontSize: width * 0.038,
  },

  transactionCard: {
    borderRadius: 12,
    padding: width * 0.04,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
  },
  transactionIconContainer: {
    width: width * 0.1,
    height: width * 0.1,
    borderRadius: width * 0.05,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: { flex: 1 },
  transactionDescription: {
    fontWeight: '600',
    fontSize: width * 0.04,
  },
  transactionLocation: {
    fontSize: width * 0.032,
  },
  transactionPointsContainer: {
    alignItems: 'flex-end',
  },
  transactionPoints: {
    fontWeight: 'bold',
    fontSize: width * 0.04,
  },
  pointsGained: {
    color: '#10B981',
  },
  pointsLost: {
    color: '#F97316',
  },
  transactionDate: {
    fontSize: width * 0.032,
  },
});
