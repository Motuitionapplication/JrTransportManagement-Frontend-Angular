
export const environment = {
  production: true,
  apiUrl:  'https://jrtransportmanagement-backend-spring.onrender.com/api',
  isLocal: false,
  apiTimeout: 20000,
  cacheTimeout: 600000, // 10 minutes

  features: {
    offlineMode: true,
    pwaInstall: true,
    pushNotifications: true,
  },
};
