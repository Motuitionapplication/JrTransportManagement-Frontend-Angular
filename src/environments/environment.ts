// Auto-detect environment based on hostname and port
function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // Local development ONLY when specifically running on localhost:4200 (ng serve)
    // AND when you want to connect to local backend
    if (hostname === 'localhost' && port === '4200') {
      // Check if local backend is preferred (you can change this flag)
      const useLocalBackend = true; // Set to true when your local Spring Boot is running with CORS
      
      if (useLocalBackend) {
        return 'http://localhost:8080/api';
      } else {
        // Even in local dev, use cloud backend
        return 'https://jrtransportmanagementbackend.onrender.com/api';
      }
    }
    
    // Production or any other domain
    return 'https://jrtransportmanagementbackend.onrender.com/api';
  }
  
  // Fallback (during SSR or build time)
  return 'https://jrtransportmanagementbackend.onrender.com/api';
}

function isLocalEnvironment(): boolean {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const port = window.location.port;
    const useLocalBackend = true; // Match the flag above
    
    return hostname === 'localhost' && port === '4200' && useLocalBackend;
  }
  return false;
}

export const environment = {
  production: false,
  apiUrl: getApiUrl(),
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
