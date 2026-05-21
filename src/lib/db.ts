import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@/lib/schema';

// Database connection string from environment variables
const connectionString = process.env.DATABASE_URL;

// Configure pool for Azure PostgreSQL or local development
const pool = connectionString 
  ? new Pool({ 
      connectionString,
      // Azure PostgreSQL requires SSL
      ssl: connectionString.includes('azure.com') 
        ? { rejectUnauthorized: false }
        : false,
      // Connection pool settings
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
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

export const db = drizzle(pool, { schema });
