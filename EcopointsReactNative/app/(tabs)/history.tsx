import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, RefreshControl, useWindowDimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface Transaction {
  id: string;
  type: "scan" | "redeem";
  description: string;
  location: string;
  points: number;
  date: string;
}

const API_BASE = 'https://ecopoints.hvd.lat/api';

const TransactionItem = ({ item }: { item: Transaction }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const { width } = useWindowDimensions();
  
  const iconContainerSize = width * 0.1;
  const descriptionSize = width * 0.04;

  return (
    <View style={[styles.transactionCard, { backgroundColor: Colors[colorScheme].background, shadowColor: Colors[colorScheme].text }]}>
      <View style={[styles.transactionIconContainer, { backgroundColor: item.type === 'scan' ? '#E0F2F1' : '#FFF7ED', width: iconContainerSize, height: iconContainerSize, borderRadius: iconContainerSize / 2 }]}>
        <FontAwesome
          name={item.type === 'scan' ? 'leaf' : 'gift'}
          size={iconContainerSize * 0.5}
          color={item.type === 'scan' ? '#10B981' : '#F97316'}
        />
      </View>
      <View style={styles.transactionDetails}>
        <Text style={[styles.transactionDescription, { color: Colors[colorScheme].text, fontSize: descriptionSize }]}>{item.description}</Text>
        <Text style={[styles.transactionLocation, { color: Colors[colorScheme].icon, fontSize: descriptionSize * 0.85 }]}>{item.location}</Text>
      </View>
      <View style={styles.transactionPointsContainer}>
        <Text style={[styles.transactionPoints, { color: item.type === 'scan' ? '#10B981' : '#F97316', fontSize: descriptionSize }]}>
          {item.type === 'scan' ? '+' : '-'}{item.points}
        </Text>
        <Text style={[styles.transactionDate, { color: Colors[colorScheme].icon, fontSize: descriptionSize * 0.75 }]}>
          {new Date(item.date.replace(" ", "T")).toLocaleDateString("es-PE", { day: "numeric", month: "short" })}
        </Text>
      </View>
    </View>
  );
}

export default function HistoryScreen() {
  const { userId, token } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const { width } = useWindowDimensions();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getAuthHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  }), [token]);

  const fetchHistory = useCallback(async () => {
    if (!userId) {
        setLoading(false);
        return;
    }
    try {
      const response = await fetch(`${API_BASE}/obtenerHistorial?usuario_id=${userId}`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error("Error al obtener historial");
      const data = await response.json();
      const sortedData = data.sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(sortedData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [userId, getAuthHeaders]);

  useEffect(() => {
    setLoading(true);
    fetchHistory();
  }, [fetchHistory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  }, [fetchHistory]);

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <FlatList
        data={transactions}
        renderItem={({ item }) => <TransactionItem item={item} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[styles.listContent, {padding: width * 0.04}]}
        ListHeaderComponent={<Text style={[styles.title, { color: Colors[colorScheme].text, fontSize: width * 0.08 }]}>Historial de actividad</Text>}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" style={{ marginTop: 50 }} />
          ) : (
            <Text style={[styles.emptyText, { color: Colors[colorScheme].icon }]}>No hay actividades registradas aún.</Text>
          )
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {},
  title: {
    fontWeight: 'bold',
    marginBottom: 20,
    paddingTop: 40, // Safe area
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  transactionCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontWeight: '600',
  },
  transactionLocation: {},
  transactionPointsContainer: {
    alignItems: 'flex-end',
  },
  transactionPoints: {
    fontWeight: 'bold',
  },
  transactionDate: {}
});