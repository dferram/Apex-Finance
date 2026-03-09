import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not defined');
  process.exit(1);
}

const pool = new Pool({ connectionString });

async function fixDateColumn() {
  const client = await pool.connect();
  
  try {
    console.log('Verificando el tipo de dato de la columna date...');
    
    // Verificar el tipo actual de la columna
    const typeCheck = await client.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'transactions' AND column_name = 'date';
    `);
    
    console.log('Tipo actual de la columna date:', typeCheck.rows[0]);
    
    // Verificar si hay valores problemáticos
    const badDates = await client.query(`
      SELECT id, description, date, pg_typeof(date) as date_type
      FROM transactions
      WHERE id IN (19, 20, 21)
      ORDER BY id;
    `);
    
    console.log('\nTransacciones con posibles problemas:');
    badDates.rows.forEach(row => {
      console.log(`ID ${row.id}: ${row.description}, date=${row.date}, type=${row.date_type}`);
    });
    
    // Si la columna es de tipo DATE en lugar de TIMESTAMP, convertirla
    if (typeCheck.rows[0]?.data_type === 'date') {
      console.log('\n⚠️  La columna date es de tipo DATE, debería ser TIMESTAMP');
      console.log('Convirtiendo columna date de DATE a TIMESTAMP...');
      
      await client.query(`
        ALTER TABLE transactions 
        ALTER COLUMN date TYPE TIMESTAMP USING date::timestamp;
      `);
      
      console.log('✓ Columna convertida exitosamente');
    } else if (typeCheck.rows[0]?.data_type === 'timestamp without time zone') {
      console.log('✓ La columna date ya es de tipo TIMESTAMP');
    }
    
    // Actualizar valores NULL o inválidos con created_at
    const updateResult = await client.query(`
      UPDATE transactions
      SET date = created_at
      WHERE date IS NULL AND created_at IS NOT NULL;
    `);
    
    console.log(`\n✓ Actualizadas ${updateResult.rowCount} transacciones con date NULL`);
    
    // Verificar el resultado
    const verification = await client.query(`
      SELECT id, description, date, created_at
      FROM transactions
      WHERE id IN (19, 20, 21)
      ORDER BY id;
    `);
    
    console.log('\nVerificación final:');
    verification.rows.forEach(row => {
      console.log(`ID ${row.id}: ${row.description}, date=${row.date}`);
    });
    
  } catch (error) {
    console.error('Error al corregir la columna date:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

fixDateColumn();
