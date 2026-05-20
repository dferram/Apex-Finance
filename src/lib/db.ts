import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@/lib/schema';

// Usa process.env.DATABASE_URL si existe, si no usa la cadena especificada.
// Se recomienda colocar la conexión en un archivo .env.local para que Next.js la tome.
const connectionString = process.env.DATABASE_URL;

// During build time, DATABASE_URL might not be available
// Create a dummy connection that will be replaced at runtime
const pool = connectionString 
  ? new Pool({ connectionString })
  : new Pool({ 
      connectionString: 'postgresql://dummy:dummy@localhost:5432/dummy',
      // Prevent actual connections during build
      max: 0,
    });

export const db = drizzle(pool, { schema });
