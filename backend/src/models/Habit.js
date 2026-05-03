const pool = require('../db');

class Habit {
  static async create(userId, name, category, difficulty_weight, color) {
    const result = await pool.run(
      'INSERT INTO habits (user_id, name, category, difficulty_weight, color) VALUES (?, ?, ?, ?, ?)',
      [userId, name, category, difficulty_weight, color]
    );
    
    const habit = await pool.get('SELECT * FROM habits WHERE id = ?', [result.lastInsertRowid]);
    
    // Create streak record for new habit
    await pool.run(
      'INSERT INTO streaks (habit_id, current_streak, longest_streak) VALUES (?, 0, 0)',
      [habit.id]
    );
    
    return habit;
  }

  static async findByUserId(userId) {
    const result = await pool.all(
      'SELECT * FROM habits WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return result;
  }

  static async findById(id) {
    const result = await pool.get('SELECT * FROM habits WHERE id = ?', [id]);
    return result;
  }

  static async update(id, name, category, difficulty_weight, color) {
    await pool.run(
      'UPDATE habits SET name = ?, category = ?, difficulty_weight = ?, color = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, category, difficulty_weight, color, id]
    );
    return await pool.get('SELECT * FROM habits WHERE id = ?', [id]);
  }

  static async delete(id) {
    await pool.run('DELETE FROM habits WHERE id = ?', [id]);
  }

  static async getWithStreaks(userId) {
    const result = await pool.all(
      `SELECT h.*, s.current_streak, s.longest_streak, s.last_completed_date
       FROM habits h
       LEFT JOIN streaks s ON h.id = s.habit_id
       WHERE h.user_id = ?
       ORDER BY h.created_at DESC`,
      [userId]
    );
    return result;
  }
}

module.exports = Habit;
