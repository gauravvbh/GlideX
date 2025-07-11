import dotenv from "dotenv";

dotenv.config({ path: './.env.local' });

const MAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

const STRIPE_KEY = process.env.EXPO_PUBLIC_STRIPE_API_KEY;


export default {
  expo: {
    name: "GlideX",
    slug: "glidex",
    platforms: ["ios", "android"],
    sdkVersion: '53.0.0',
    version: "1.0.4",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "automatic",
    scheme: "myapp",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "cover",
      backgroundColor: "#0C0B0B"
    },
    updates: {
      enabled: true,
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.gauravvbh.glidex",
      config: {
        googleMapsApiKey: MAPS_KEY
      },
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "We need your location to show it on the map"
      }
    },
    android: {
      package: "com.gauravvbh.glidex",
      hermesEnabled: true,
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ],
      config: {
        googleMaps: {
          apiKey: MAPS_KEY
        }
      }
    },
    plugins: [
      "expo-secure-store",
      [
        "react-native-maps-expo-plugin",
        {
          googleMapsApiKey: MAPS_KEY
        }
      ],
      [
        "expo-notifications",
        {
          icon: "./assets/images/notification_icon.png",
          color: "#ffffff",
          defaultChannel: "default",
          sounds: [
            "./assets/notification_sound.wav",
            "./assets/notification_sound_other.wav"
          ],
          enableBackgroundRemoteNotifications: false
        }
      ],
      [
        "expo-router",
        {
          origin: "https://glidex.expo.app"
        }
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "The app accesses your photos to let you share them with your friends.",
          cameraPermission: "The app accesses your camera to allow you to take photos."
        }
      ],
      [
        "@stripe/stripe-react-native",
        {
          enableGooglePay: true,
          publishableKey: STRIPE_KEY
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "43ad45d8-f2b4-456e-a48f-cfb48faeb6aa"
      },
      googleMapsApiKey: MAPS_KEY,
      stripeApiKey: STRIPE_KEY,
      clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
      serverUrl: process.env.EXPO_PUBLIC_SERVER_URL,
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      webSocketServerUrl: process.env.EXPO_PUBLIC_WEB_SOCKET_SERVER_URL,
      databaseUrl: process.env.DATABASE_URL
    },
    owner: "gauravvbh",
    web: {
      bundler: "metro",
      output: "server",
      favicon: "./assets/images/favicon.png"
    }
  }
};
