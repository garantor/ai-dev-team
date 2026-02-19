import pool from '../config/db.js';

class UserModel {
  static async create({ firebase_uid, email, password, name, university }) {
    const query = `
      INSERT INTO users (firebase_uid, email, password, name, university)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, firebase_uid, email, name, university, created_at, updated_at;
    `;
    const values = [firebase_uid, email, password, name, university];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findByEmail(email) {
    const query = `
      SELECT id, firebase_uid, email, password, name, university, created_at, updated_at
      FROM users
      WHERE email = $1;
    `;
    const { rows } = await pool.query(query, [email]);
    return rows[0];
  }

  static async findByFirebaseUid(firebase_uid) {
    const query = `
      SELECT id, firebase_uid, email, name, university, created_at, updated_at
      FROM users
      WHERE firebase_uid = $1;
    `;
    const { rows } = await pool.query(query, [firebase_uid]);
    return rows[0];
  }
}

export default UserModel;
