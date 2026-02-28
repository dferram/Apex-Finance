import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@/lib/schema';

// Usa process.env.DATABASE_URL si existe, si no usa la cadena especificada.
// Se recomienda colocar la conexión en un archivo .env.local para que Next.js la tome.
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

const pool = new Pool({
  connectionString,
});

export const db = drizzle(pool, { schema });
