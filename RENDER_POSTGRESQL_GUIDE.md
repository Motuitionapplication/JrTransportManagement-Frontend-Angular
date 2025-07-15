# Render PostgreSQL Integration Guide

## Overview
This guide helps you connect your JR Transport Management application to a Render PostgreSQL database.

## Prerequisites
1. A Render account with a PostgreSQL database service
2. Your Render PostgreSQL connection details

## Step 1: Set Up Render PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "PostgreSQL"
3. Configure your database:
   - Name: `jr-transport-db` (or your preferred name)
   - Database: `jr_transport_management`
   - User: `jr_transport_user` (auto-generated)
   - Region: Choose closest to your users
   - PostgreSQL Version: 14 or later

## Step 2: Get Connection Details

After creating the database, Render provides:
- **Internal Database URL**: For services within Render
- **External Database URL**: For external connections (use this one)

Example format:
```
postgresql://username:password@hostname:port/database_name
```

## Step 3: Update Environment Configuration

### Development Environment (`src/environments/environment.ts`)
```typescript
export const environment = {
  production: false,
  // ... other config
  database: {
    host: 'your-render-db-hostname',
    port: 5432,
    database: 'jr_transport_management',
    username: 'your-username',
    password: 'your-password',
    ssl: true, // Required for Render
    connectionString: 'your-external-database-url'
  }
};
```

### Production Environment (`src/environments/environment.prod.ts`)
```typescript
export const environment = {
  production: true,
  // ... other config
  database: {
    host: process.env['DB_HOST'] || 'your-render-db-hostname',
    port: parseInt(process.env['DB_PORT'] || '5432'),
    database: process.env['DB_NAME'] || 'jr_transport_management',
    username: process.env['DB_USER'] || 'your-username',
    password: process.env['DB_PASSWORD'] || 'your-password',
    ssl: true,
    connectionString: process.env['DATABASE_URL'] || 'your-external-database-url'
  }
};
```

## Step 4: Backend API Setup (Node.js/Express Example)

If you need a backend API to connect to PostgreSQL:

### Install Dependencies
```bash
npm install pg cors express dotenv
npm install --save-dev @types/pg
```

### Basic Server Setup (`server.js`)
```javascript
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(cors());
app.use(express.json());

// Test connection endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    res.json({ 
      success: true, 
      message: 'Database connected successfully',
      timestamp: result.rows[0].now 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed',
      error: err.message 
    });
  }
});

// Get tables endpoint
app.get('/api/tables', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    client.release();
    res.json({ 
      success: true, 
      tables: result.rows 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

## Step 5: Environment Variables for Production

Create a `.env` file for local development:
```env
DATABASE_URL=your-render-external-database-url
DB_HOST=your-render-db-hostname
DB_PORT=5432
DB_NAME=jr_transport_management
DB_USER=your-username
DB_PASSWORD=your-password
```

## Step 6: Test the Connection

1. Navigate to the Database Test page in your application
2. Click "Test Connection" to verify the connection
3. Use "List Tables" to see available tables
4. Execute custom queries to test functionality

## Step 7: Create Sample Tables

Use the custom query section to create your transport management tables:

```sql
-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  registration_number VARCHAR(20) UNIQUE NOT NULL,
  vehicle_type VARCHAR(50) NOT NULL,
  capacity INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  license_number VARCHAR(20) UNIQUE NOT NULL,
  phone VARCHAR(15),
  email VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Routes table
CREATE TABLE IF NOT EXISTS routes (
  id SERIAL PRIMARY KEY,
  route_name VARCHAR(100) NOT NULL,
  start_location VARCHAR(100) NOT NULL,
  end_location VARCHAR(100) NOT NULL,
  distance_km DECIMAL(8,2),
  estimated_duration INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO vehicles (registration_number, vehicle_type, capacity) VALUES
('TN01AB1234', 'Bus', 45),
('TN02CD5678', 'Mini Bus', 25),
('TN03EF9012', 'Van', 12);

INSERT INTO drivers (name, license_number, phone, email) VALUES
('John Doe', 'DL001234567', '+91-9876543210', 'john.doe@email.com'),
('Jane Smith', 'DL002345678', '+91-9876543211', 'jane.smith@email.com');

INSERT INTO routes (route_name, start_location, end_location, distance_km, estimated_duration) VALUES
('Route A', 'City Center', 'Airport', 25.5, 45),
('Route B', 'Railway Station', 'University', 15.2, 30);
```

## Troubleshooting

### Common Issues:

1. **SSL Connection Required**
   - Render requires SSL connections
   - Ensure `ssl: true` in your connection configuration

2. **Connection Timeout**
   - Check your database hostname and port
   - Verify your IP is not blocked (Render allows all IPs by default)

3. **Authentication Failed**
   - Double-check username and password
   - Ensure you're using the External Database URL

4. **CORS Issues**
   - Configure CORS properly in your backend
   - Use proper headers for cross-origin requests

### Testing Connection String Format:
```
postgresql://username:password@hostname:port/database
```

Example:
```
postgresql://jr_transport_user:abc123xyz@dpg-xyz123-45.singapore-postgres.render.com:5432/jr_transport_management
```

## Next Steps

1. Set up your backend API endpoints
2. Create database migrations for your tables
3. Implement CRUD operations for vehicles, drivers, routes
4. Add authentication and authorization
5. Deploy your application to production

## Security Best Practices

1. Never commit database credentials to version control
2. Use environment variables for sensitive data
3. Implement proper authentication for API endpoints
4. Use connection pooling for better performance
5. Regularly backup your database
6. Monitor database performance and usage

For more help, visit:
- [Render PostgreSQL Documentation](https://render.com/docs/databases)
- [Angular HttpClient Guide](https://angular.io/guide/http)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
