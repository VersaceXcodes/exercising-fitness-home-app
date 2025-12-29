export default ({ config }) => ({
    ...config,
    extra: {
      ...config.extra,
      EXPO_PUBLIC_LAUNCHPULSE_API_KEY: process.env.EXPO_PUBLIC_LAUNCHPULSE_API_KEY,
      EXPO_PUBLIC_LAUNCHPULSE_PROJECT_ID: process.env.EXPO_PUBLIC_LAUNCHPULSE_PROJECT_ID,
      EXPO_PUBLIC_LAUNCHPULSE_API_URL: process.env.EXPO_PUBLIC_LAUNCHPULSE_API_URL || 'https://launchpulse.ai',
      apiUrl: process.env.EXPO_PUBLIC_API_URL || config.extra?.apiUrl,
      frontendUrl: process.env.EXPO_PUBLIC_FRONTEND_URL || config.extra?.frontendUrl,
    },
  });