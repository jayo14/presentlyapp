export default ({ config }) => {
  return {
    ...config,
    name: "Presently",
    slug: "presently-attendance-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "../frontend/public/logo.png",
    scheme: "rork-app",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "../frontend/public/logo.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: "app.rork.presently-attendance-app",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "../frontend/public/logo.png",
        backgroundColor: "#ffffff",
      },
      package: "app.rork.presently_attendance_app",
    },
    web: {
      favicon: "../frontend/public/logo.png",
    },
    plugins: [
      [
        "expo-router",
        {
          origin: "https://rork.com/",
        },
      ],
      "expo-font",
      "expo-web-browser",
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
