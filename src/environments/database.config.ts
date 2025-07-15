// Database configuration for JR Transport Management
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  connectionString?: string;
}

// Render PostgreSQL Configuration
// Replace these values with your actual Render PostgreSQL credentials
export const renderDatabaseConfig: DatabaseConfig = {
  host: 'your-render-postgres-host.com', // e.g., dpg-xxxxx-a.oregon-postgres.render.com
  port: 5432,
  database: 'your_database_name',
  username: 'your_username',
  password: 'your_password', 
  ssl: true, // Render requires SSL
  connectionString: 'postgresql://username:password@hostname:port/database_name'
};

// Local Development PostgreSQL Configuration (if needed)
export const localDatabaseConfig: DatabaseConfig = {
  host: 'localhost',
  port: 5432,
  database: 'jr_transport_dev',
  username: 'postgres',
  password: 'your_local_password',
  ssl: false
};

// Auto-detect database configuration based on environment
export function getDatabaseConfig(): DatabaseConfig {
  const isProduction = window.location.hostname !== 'localhost';
  return isProduction ? renderDatabaseConfig : localDatabaseConfig;
}

// Connection string builder
export function buildConnectionString(config: DatabaseConfig): string {
  if (config.connectionString) {
    return config.connectionString;
  }
  
  const sslParam = config.ssl ? '?sslmode=require' : '';
  return `postgresql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}${sslParam}`;
}
