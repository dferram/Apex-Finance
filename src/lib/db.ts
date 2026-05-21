import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@/lib/schema';

// Database connection string from environment variables
const connectionString = process.env.DATABASE_URL;

// Configure pool for Azure PostgreSQL or local development
// Optimized settings for faster connections
const pool = connectionString 
  ? new Pool({ 
      connectionString,
      // Azure PostgreSQL requires SSL
      ssl: connectionString.includes('azure.com') 
        ? { rejectUnauthorized: false }
        : false,
      // Optimized connection pool settings
      max: 10, // Reduced from 20 to avoid overhead
      min: 2, // Keep 2 connections warm
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000, // Reduced from 10s to 5s
      // Keep connections alive
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    })
  : new Pool({ 
      connectionString: 'postgresql://dummy:dummy@localhost:5432/dummy',
      // Prevent actual connections during build
      max: 0,
    });

// Log connection info (without sensitive data)
if (connectionString && process.env.NODE_ENV !== 'production') {
  const host = connectionString.includes('azure.com') ? 'Azure PostgreSQL' : 'Local PostgreSQL';
  console.log(`📊 Database: Connected to ${host}`);
}

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

export const db = drizzle(pool, { schema });
