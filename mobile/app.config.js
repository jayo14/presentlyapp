export default ({ config }) => {
  return {
    ...config,
    name: "Presently",
    slug: "presently-app-new",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/logo.png",
    scheme: "presently-app-new",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/logo.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.presently.app",
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "Presently needs your location to verify your attendance in class.",
        NSCameraUsageDescription: "Presently needs camera access to scan session QR codes.",
        NSMotionUsageDescription: "Presently uses motion sensors to detect behavioral signals during attendance check-in."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/logo.png",
        backgroundColor: "#ffffff",
      },
      package: "com.presently.app",
      permissions: [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "CAMERA",
        "RECORD_AUDIO"
      ]
    },
    web: {
      favicon: "./assets/logo.png",
    },
    plugins: [
      "expo-router",
      "expo-font",
      "expo-web-browser",
      [
        "expo-location",
        {
          locationAlwaysPermission: "Allow Presently to use your location even in the background for attendance verification."
        }
      ],
      "expo-camera",
      "expo-sensors"
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      ...config.extra,
      router: {
        origin: "https://rork.com/",
      },
      eas: {
        projectId: "779f0fff-8c3c-4cbb-a292-9fd2987147ba",
      },
      API_URL: process.env.API_URL,
    },
  };
};
