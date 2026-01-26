require('dotenv').config();

module.exports = {
  expo: {
    name: 'scanly-app',
    slug: 'scanly-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    scheme: 'scanly',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.scanlylabs.scanly',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: ['expo-router', 'expo-barcode-scanner'],
    extra: {
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:8080',
      eas: {
        projectId: 'bed600ee-d655-4d66-8f8b-a28ed4641964',
      },
    },
  },
};
