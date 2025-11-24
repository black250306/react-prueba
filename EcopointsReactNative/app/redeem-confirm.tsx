import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { FontAwesome } from '@expo/vector-icons';

const API_BASE = 'https://ecopoints.hvd.lat/api';

export default function RedeemConfirmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<any>();
  const { userId, token } = useAuth();

  const [reward, setReward] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    // The params object from the router contains the reward data
    if (params) {
      setReward({
        ...params,
        points: Number(params.points), // Ensure points is a number
      });
    }

    const fetchPoints = async () => {
        if (!userId || !token) return;
        try {
            const response = await fetch(`${API_BASE}/obtenerPuntos?usuario_id=${userId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if(response.ok) {
                setUserPoints(data.puntos || 0);
            }
        } catch (error) {
            console.error("Failed to fetch points", error);
        }
    };
    fetchPoints();
  }, [params, userId, token]);

  const handleConfirmRedeem = async () => {
    if (!reward) return;
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/canjearPuntos`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          usuario_id: parseInt(userId!),
          convenio_id: parseInt(reward.id)
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Error al procesar el canje.');
      }

      // On success, navigate to the success screen with the new data
      router.replace({ 
        pathname: "/redeem-success", 
        params: { 
            name: reward.name,
            brand: reward.brand,
            points: reward.points,
            redemptionCode: data.codigo_entrega 
        }
      });

    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo completar el canje.');
    } finally {
      setLoading(false);
    }
  };

  if (!reward) {
    return <View style={styles.container}><ActivityIndicator /></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirmar Canje</Text>
      
      <Image source={{ uri: reward.image }} style={styles.rewardImage} />
      <Text style={styles.brand}>{reward.brand}</Text>
      <Text style={styles.name}>{reward.name}</Text>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Costo:</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <FontAwesome name="leaf" size={16} color="#10B981" style={{marginRight: 4}}/>
                <Text style={styles.detailValue}>{reward.points} puntos</Text>
            </View>
        </View>
        <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tu saldo actual:</Text>
            <Text style={styles.detailValue}>{userPoints} puntos</Text>
        </View>
        <View style={[styles.detailRow, {borderTopWidth: 1, borderColor: '#eee', paddingTop: 10}]}>
            <Text style={styles.detailLabel}>Tu saldo después:</Text>
            <Text style={[styles.detailValue, {fontWeight: 'bold'}]}>{userPoints - reward.points} puntos</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmRedeem} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Confirmar y Canjear</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()} disabled={loading}>
        <Text style={styles.cancelText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  rewardImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 12,
  },
  brand: {
      fontSize: 16,
      color: '#6B7280'
  },
  name: {
      fontSize: 20,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: 20,
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 16,
    color: '#374151',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButton: {
    width: '100%',
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    width: '100%',
    padding: 16,
    alignItems: 'center',
  },
  cancelText: {
    color: '#6B7280',
    fontSize: 16,
  }
});