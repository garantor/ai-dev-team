import pg from 'pg';

const { Pool } = pg;

// Ensure DATABASE_URL is set in .env
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not defined in environment variables.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Optional: Add SSL configuration if connecting to a remote database like Heroku Postgres
  // ssl: {
  //   rejectUnauthorized: false
  // }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test database connection
(async () => {
  try {
    await pool.query('SELECT 1');
    console.log('PostgreSQL database connected successfully.');
    // Create users table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        firebase_uid VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        university VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Users table checked/created.');
  } catch (err) {
    console.error('Error connecting to PostgreSQL or creating table:', err);
    process.exit(1);
  }
})();

export default pool;
