// Auto-detect environment based on hostname  
function getApiUrl(): string {
  // Production build always uses cloud backend
  return 'https://jrtransportmanagementbackend.onrender.com/api';
}

function isLocalEnvironment(): boolean {
  // Production build is never considered local
  return false;
}

export const environment = {
  production: true,
  apiUrl: getApiUrl(),
  isLocal: isLocalEnvironment(),
  apiTimeout: 20000,
  cacheTimeout: 600000, // 10 minutes
  
  // Database Configuration for Production
  database: {
    host: 'your-render-postgres-host.com', // Replace with your actual Render PostgreSQL host
    port: 5432,
    database: 'your_database_name', // Replace with your actual database name
    username: 'your_username', // Replace with your actual username
    password: 'your_password', // Replace with your actual password
    ssl: true, // Render requires SSL
    connectionString: 'your_full_connection_string' // Replace with your actual connection string
  },
  
  features: {
    offlineMode: true,
    pwaInstall: true,
    pushNotifications: true
  },
  auth: {
    username: 'admin',
    password: 'password'
  }
};
