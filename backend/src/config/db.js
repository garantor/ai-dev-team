import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const connectDB = async () => {
  try {
    await pool.query(`
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
    console.log('PostgreSQL connected and table ensured.');
  } catch (err) {
    console.error('Database connection or table creation error:', err.message);
    process.exit(1);
  }
};

export const query = (text, params) => pool.query(text, params);
