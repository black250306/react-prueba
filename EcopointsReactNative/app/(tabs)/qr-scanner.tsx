import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Linking, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { FontAwesome } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useAuth } from '@/hooks/useAuth';
import { useIsFocused } from '@react-navigation/native';

const API_BASE = 'https://ecopoints.hvd.lat/api';

export default function QRScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [zoom, setZoom] = useState(0);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; points?: number } | null>(null);
  const { token } = useAuth();
  const isFocused = useIsFocused(); // Hook to check if the screen is focused

  useEffect(() => {
    // Reset scanner state when the screen is focused
    if (isFocused) {
      setScanned(false);
      setScanResult(null);
    }
  }, [isFocused]);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return; // Prevent multiple scans
    setScanned(true);

    try {
      const response = await fetch(`${API_BASE}/validarQR`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ codigo_qr: data })
      });
      
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Código QR inválido o expirado.');
      }

      setScanResult({ success: true, message: result.mensaje, points: result.puntos_obtenidos });
    } catch (error: any) {
      setScanResult({ success: false, message: error.message || 'Error al procesar el QR.' });
    }
  };

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <FontAwesome name="camera" size={50} color="#6B7280" />
        <Text style={styles.permissionText}>Necesitamos tu permiso para usar la cámara</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Conceder Permiso</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openSettings()}>
            <Text style={styles.settingsText}>Abrir configuración</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const renderScanner = () => (
     <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        zoom={zoom}
      >
        <View style={styles.overlay}>
          <View style={styles.scanBox} />
          <Text style={styles.scanText}>Apunta al código QR</Text>
          <View style={styles.zoomContainer}>
              <FontAwesome name="search-minus" size={20} color="white"/>
              <Slider
                style={{ width: '70%', height: 40 }}
                minimumValue={0}
                maximumValue={1}
                value={zoom}
                onValueChange={setZoom}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="rgba(255,255,255,0.5)"
              />
              <FontAwesome name="search-plus" size={20} color="white"/>
          </View>
        </View>
      </CameraView>
  );
  
  const renderResult = () => (
    <View style={[styles.resultContainer, {backgroundColor: scanResult?.success ? '#E0F2F1' : '#FEE2E2'}]}>
        <FontAwesome 
            name={scanResult?.success ? "check-circle" : "times-circle"} 
            size={60} 
            color={scanResult?.success ? "#10B981" : "#EF4444"}
        />
        <Text style={[styles.resultTitle, {color: scanResult?.success ? "#065F46" : "#991B1B"}]}>
            {scanResult?.success ? "¡Escaneo Exitoso!" : "Error"}
        </Text>
        {scanResult?.success && (
            <Text style={styles.pointsText}>+ {scanResult.points} ecopoints</Text>
        )}
        <Text style={styles.resultMessage}>{scanResult?.message}</Text>
        <TouchableOpacity style={styles.button} onPress={() => { setScanned(false); setScanResult(null); }}>
          <Text style={styles.buttonText}>Escanear de Nuevo</Text>
        </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {isFocused && !scanResult ? renderScanner() : null}
      {scanResult && renderResult()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  permissionText: {
    textAlign: 'center',
    fontSize: 18,
    margin: 20,
    color: 'white',
  },
  settingsText: {
    color: '#007AFF',
    marginTop: 10,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  scanBox: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 12,
  },
  scanText: {
    color: 'white',
    fontSize: 16,
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  zoomContainer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 8,
  },
  resultContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginTop: 16,
  },
  pointsText: {
      fontSize: 36,
      fontWeight: 'bold',
      color: '#065F46',
      marginVertical: 8,
  },
  resultMessage: {
      fontSize: 16,
      textAlign: 'center',
      color: '#374151',
      marginBottom: 30,
  },
  button: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});