module.exports = {
  expo: {
    name: 'Ecopoints App',
    slug: 'EcopointsApp',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'ecopoints',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/images/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#00b975',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.ecoPoints.App',
      infoPlist: {
        NSCameraUsageDescription: 'Necesitamos acceso a la cámara para escanear códigos QR en las estaciones de reciclaje.',
        NSLocationWhenInUseUsageDescription: 'Necesitamos tu ubicación para mostrarte las estaciones de reciclaje más cercanas.',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.ecoPoints.App',
      permissions: [
        'CAMERA',
        'ACCESS_COARSE_LOCATION',
        'ACCESS_FINE_LOCATION',
      ],
    },
    web: {
      bundler: 'metro',
      output: 'static',
    },
    plugins: [
        'expo-router', 
        'expo-font', 
        'expo-secure-store',
        [
            "expo-camera",
            {
              "cameraPermission": "Necesitamos acceso a la cámara para escanear códigos QR."
            }
        ]
    ],
    experiments: {
      typedRoutes: true,
    },
  },
};