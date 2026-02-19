import { query } from '../config/db.js';

export const createWorkout = async ({ userId, type, duration_minutes, calories_burned, notes, workout_date }) => {
  const res = await query(
    `INSERT INTO workouts (user_id, type, duration_minutes, calories_burned, notes, workout_date)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [userId, type, duration_minutes, calories_burned, notes, workout_date]
  );
  return res.rows[0];
};

export const getWorkoutsByUserId = async (userId) => {
  const res = await query(
    `SELECT id, user_id, type, duration_minutes, calories_burned, notes, workout_date, created_at, updated_at
     FROM workouts WHERE user_id = $1 ORDER BY workout_date DESC, created_at DESC`,
    [userId]
  );
  return res.rows;
};

export const getWorkoutByIdAndUserId = async (id, userId) => {
  const res = await query(
    `SELECT id, user_id, type, duration_minutes, calories_burned, notes, workout_date, created_at, updated_at
     FROM workouts WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return res.rows[0];
};

export const updateWorkout = async (id, userId, { type, duration_minutes, calories_burned, notes, workout_date }) => {
  const res = await query(
    `UPDATE workouts
     SET type = $1, duration_minutes = $2, calories_burned = $3, notes = $4, workout_date = $5, updated_at = CURRENT_TIMESTAMP
     WHERE id = $6 AND user_id = $7 RETURNING *`,
    [type, duration_minutes, calories_burned, notes, workout_date, id, userId]
  );
  return res.rows[0];
};

export const deleteWorkout = async (id, userId) => {
  const res = await query(
    `DELETE FROM workouts WHERE id = $1 AND user_id = $2 RETURNING id`,
    [id, userId]
  );
  return res.rows[0];
};
