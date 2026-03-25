export default ({ config }) => {
  return {
    ...config,
    name: "Presently",
    slug: "presently-attendance-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "../frontend/public/logo.png",
    scheme: "presently-app",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "../frontend/public/logo.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.getpresently.app",
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "Presently needs your location to verify your attendance in class.",
        NSCameraUsageDescription: "Presently needs camera access to scan session QR codes.",
        NSMotionUsageDescription: "Presently uses motion sensors to detect behavioral signals during attendance check-in."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "../frontend/public/logo.png",
        backgroundColor: "#ffffff",
      },
      package: "com.getpresently.app",
      permissions: [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "CAMERA",
        "RECORD_AUDIO"
      ]
    },
    web: {
      favicon: "../frontend/public/logo.png",
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
        projectId: "62a94bff-8f92-4650-88aa-012973eb62fb",
      },
      API_URL: process.env.API_URL,
    },
  };
};
