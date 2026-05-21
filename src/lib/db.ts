import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@/lib/schema';

// Database connection string from environment variables
const connectionString = process.env.DATABASE_URL;

// Fix SSL mode for Azure (use verify-full instead of require)
const fixedConnectionString = connectionString?.replace('sslmode=require', 'sslmode=verify-full');

// Configure pool for Azure PostgreSQL or local development
// Optimized settings for faster connections
const pool = fixedConnectionString 
  ? new Pool({ 
      connectionString: fixedConnectionString,
      // Azure PostgreSQL requires SSL
      ssl: fixedConnectionString.includes('azure.com') 
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

// Detailed logging for database connection
if (fixedConnectionString) {
  try {
    const isAzure = fixedConnectionString.includes('azure.com');
    const url = new URL(fixedConnectionString.replace('postgresql://', 'http://'));
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('DATABASE CONNECTION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Type: ${isAzure ? 'Azure PostgreSQL' : 'Local PostgreSQL'}`);
    console.log(`Host: ${url.hostname}`);
    console.log(`Port: ${url.port || '5432'}`);
    console.log(`Database: ${url.pathname.slice(1)}`);
    console.log(`User: ${url.username}`);
    console.log(`SSL: ${isAzure ? 'Enabled (verify-full)' : 'Disabled'}`);
    console.log(`Pool: min=${pool.options.min}, max=${pool.options.max}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (err) {
    console.error('WARNING: Error parsing DATABASE_URL:', err);
  }
} else {
  console.log('WARNING: DATABASE_URL not configured (build mode)\n');
}

// Handle pool errors
pool.on('error', (err) => {
  console.error('[Database] Unexpected pool error:', err.message);
});

// Handle successful connections
pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Database] Connection established');
  }
});

export const db = drizzle(pool, { schema });
