const LOCAL_API_URL = 'http://localhost:8080/api';

// Always point the dev environment at the local backend
function getApiUrl(): string {
  return LOCAL_API_URL;
}

function isLocalEnvironment(): boolean {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const port = window.location.port;
    return hostname === 'localhost' && port === '4200';
  }
  return true;
}

export const environment = {
  production: false,
  apiUrl: LOCAL_API_URL,
  isLocal: isLocalEnvironment(),
  apiTimeout: isLocalEnvironment() ? 10000 : 20000,
  cacheTimeout: 300000, // 5 minutes

  features: {
    offlineMode: !isLocalEnvironment(),
    pwaInstall: !isLocalEnvironment(),
    pushNotifications: !isLocalEnvironment(),
  },
};
