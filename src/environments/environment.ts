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
  
  // Database Configuration (for development)
  database: {
    host: 'localhost', // Use localhost for development
    port: 5432,
    database: 'jr_transport_dev',
    username: 'postgres',
    password: 'password',
    ssl: false, // No SSL for local development
    connectionString: 'postgresql://postgres:password@localhost:5432/jr_transport_dev'
  },
  
  features: {
    offlineMode: !isLocalEnvironment(),
    pwaInstall: !isLocalEnvironment(),
    pushNotifications: !isLocalEnvironment()
  },
  auth: {
    username: 'admin',
    password: 'password'
  }
};
