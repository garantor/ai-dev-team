import pg from 'pg';
import { DATABASE_URL, TEST_DATABASE_URL } from './env.js';

// Determine which database URL to use based on the environment
const connectionString = process.env.NODE_ENV === 'test' ? TEST_DATABASE_URL : DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not defined in environment variables.');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: connectionString,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const connectDB = async () => {
  let client;
  try {
    client = await pool.connect(); // Acquire a client from the pool
    console.log('Connected to PostgreSQL database');

    // Ensure the workouts table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS workouts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        type VARCHAR(255) NOT NULL,
        duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
        calories_burned INTEGER CHECK (calories_burned >= 0),
        notes TEXT,
        workout_date DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('PostgreSQL workouts table ensured.');

    // Ensure index exists
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts (user_id);
    `);

    // Ensure update_updated_at_column function exists (idempotent creation)
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
          CREATE OR REPLACE FUNCTION update_updated_at_column()
          RETURNS TRIGGER AS $$
          BEGIN
              NEW.updated_at = NOW();
              RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;
        END IF;
      END
      $$;
    `);

    // Ensure update_workouts_updated_at trigger exists (idempotent creation)
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_workouts_updated_at') THEN
          CREATE TRIGGER update_workouts_updated_at
          BEFORE UPDATE ON workouts
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
        END IF;
      END
      $$;
    `);
    console.log('PostgreSQL workouts index and trigger ensured.');

  } catch (err) {
    console.error('Database connection or table creation error:', err.message || err);
    process.exit(1);
  } finally {
    if (client) {
      client.release(); // Release the client back to the pool
    }
  }
};

export const query = (text, params) => pool.query(text, params);

export const closeDb = async () => {
  try {
    await pool.end();
    console.log('PostgreSQL database connection pool closed');
  } catch (err) {
    console.error('Error closing PostgreSQL database connection pool', err);
  }
};

/*
SQL Schema for workouts table:

CREATE TABLE workouts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    type VARCHAR(255) NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    calories_burned INTEGER CHECK (calories_burned >= 0),
    notes TEXT,
    workout_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workouts_user_id ON workouts (user_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workouts_updated_at
BEFORE UPDATE ON workouts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
*/