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
      // Optimized connection pool settings for Azure
      max: 20, // Increased for better concurrency
      min: 5, // Keep more connections warm
      idleTimeoutMillis: 60000, // 1 minute
      connectionTimeoutMillis: 10000, // 10 seconds
      // Keep connections alive to avoid reconnection overhead
      keepAlive: true,
      keepAliveInitialDelayMillis: 5000,
      // Statement timeout to prevent hanging queries
      statement_timeout: 30000, // 30 seconds
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
    console.log(`Pool: min=${pool.options.min}, max=${pool.options.max}, timeout=${pool.options.connectionTimeoutMillis}ms`);
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
