const PRODUCTION_API_URL = 'https://jrtransportmanagementbackend.onrender.com/api';

export const environment = {
  production: true,
  apiUrl: PRODUCTION_API_URL,
  isLocal: false,
  apiTimeout: 20000,
  cacheTimeout: 600000, // 10 minutes
  
  // Database Configuration for Production  
  database: {
    host: 'dpg-d3l6rgd6ubrc73940ps0-a.oregon-postgres.render.com',
    port: 5432,
    database: 'jrtransportdb',
    username: 'root',
    password: 'WNrHHUj9SDiu8tLrnXaT4mqt89UuVylt',
    ssl: true, // Render requires SSL
    connectionString: 'postgresql://root:WNrHHUj9SDiu8tLrnXaT4mqt89UuVylt@dpg-d3l6rgd6ubrc73940ps0-a.oregon-postgres.render.com:5432/jrtransportdb'
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
