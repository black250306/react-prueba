import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

export default function RedeemSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { name, brand, points, redemptionCode } = params;

  const copyToClipboard = async () => {
    if (typeof redemptionCode === 'string') {
        await Clipboard.setStringAsync(redemptionCode);
        Alert.alert("Copiado", "¡Código de canje copiado al portapapeles!");
    }
  };

  return (
    <View style={styles.container}>
      <FontAwesome name="check-circle" size={80} color="#10B981" />
      
      <Text style={styles.title}>¡Canje Exitoso!</Text>
      <Text style={styles.subtitle}>Has canjeado {points} ecopoints por:</Text>
      
      <View style={styles.rewardInfo}>
        <Text style={styles.brand}>{brand}</Text>
        <Text style={styles.name}>{name}</Text>
      </View>

      <View style={styles.codeContainer}>
        <Text style={styles.codeLabel}>Tu código de canje:</Text>
        <Text style={styles.redemptionCode}>{redemptionCode || 'N/A'}</Text>
        <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
            <FontAwesome name="copy" size={16} color="#374151" style={{marginRight: 8}}/>
            <Text style={styles.copyButtonText}>Copiar código</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.instructions}>
        Presenta este código en el establecimiento para reclamar tu premio.
      </Text>

      <TouchableOpacity style={styles.doneButton} onPress={() => router.push('/(tabs)/rewards')}>
        <Text style={styles.doneButtonText}>Entendido</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  rewardInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  brand: {
      fontSize: 16,
      color: '#6B7280'
  },
  name: {
      fontSize: 20,
      fontWeight: '600',
  },
  codeContainer: {
    width: '100%',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  codeLabel: {
    fontSize: 14,
    color: '#374151',
  },
  redemptionCode: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10B981',
    marginVertical: 12,
    letterSpacing: 2,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  instructions: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  doneButton: {
    width: '100%',
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});