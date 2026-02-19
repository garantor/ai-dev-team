import pool from '../config/db.js';

class UserModel {
  /**
   * Creates a new user record in the PostgreSQL database.
   * @param {object} userData - The user data to store.
   * @param {string} userData.firebase_uid - The UID from Firebase Authentication.
   * @param {string} userData.email - The user's email.
   * @param {string} userData.name - The user's name.
   * @param {string} [userData.university] - The user's university (optional).
   * @returns {Promise<object>} The created user record.
   */
  static async createUser({ firebase_uid, email, name, university }) {
    const query = `
      INSERT INTO users (firebase_uid, email, name, university)
      VALUES ($1, $2, $3, $4)
      RETURNING id, firebase_uid, email, name, university, created_at;
    `;
    const values = [firebase_uid, email, name, university];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  /**
   * Finds a user by their Firebase UID.
   * @param {string} firebase_uid - The Firebase UID of the user.
   * @returns {Promise<object|null>} The user record if found, otherwise null.
   */
  static async findByFirebaseUid(firebase_uid) {
    const query = 'SELECT id, firebase_uid, email, name, university, created_at FROM users WHERE firebase_uid = $1;';
    const { rows } = await pool.query(query, [firebase_uid]);
    return rows[0] || null;
  }

  /**
   * Finds a user by their email address.
   * @param {string} email - The email address of the user.
   * @returns {Promise<object|null>} The user record if found, otherwise null.
   */
  static async findByEmail(email) {
    const query = 'SELECT id, firebase_uid, email, name, university, created_at FROM users WHERE email = $1;';
    const { rows } = await pool.query(query, [email]);
    return rows[0] || null;
  }
}

export default UserModel;
