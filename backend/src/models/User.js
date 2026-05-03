const bcrypt = require('bcryptjs');
const pool = require('../db');

class User {
  static async create(email, username, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.run(
      'INSERT INTO users (email, username, password) VALUES (?, ?, ?)',
      [email, username, hashedPassword]
    );
    return { id: result.lastInsertRowid, email, username };
  }

  static async findByEmail(email) {
    const result = await pool.get('SELECT * FROM users WHERE email = ?', [email]);
    return result;
  }

  static async findById(id) {
    const result = await pool.get('SELECT id, email, username, created_at FROM users WHERE id = ?', [id]);
    return result;
  }

  static async verifyPassword(hashedPassword, plainPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async getStats(userId) {
    const result = await pool.get('SELECT * FROM user_stats WHERE user_id = ?', [userId]);
    return result || { user_id: userId, total_xp: 0, level: 1, total_completed: 0 };
  }
}

module.exports = User;
