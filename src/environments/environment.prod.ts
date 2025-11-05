const PRODUCTION_API_URL =
  'https://jrtransportmanagement-backend-spring.onrender.com/api';

export const environment = {
  production: true,
  apiUrl: PRODUCTION_API_URL,
  isLocal: false,
  apiTimeout: 20000,
  cacheTimeout: 600000, // 10 minutes

  features: {
    offlineMode: true,
    pwaInstall: true,
    pushNotifications: true,
  },
};
