const pool = require('../db');

class HabitLog {
  static async logCompletion(habitId, date, completed) {
    const existingLog = await pool.get(
      'SELECT id FROM habit_logs WHERE habit_id = ? AND date = ?',
      [habitId, date]
    );

    if (existingLog) {
      await pool.run(
        'UPDATE habit_logs SET completed = ?, updated_at = CURRENT_TIMESTAMP WHERE habit_id = ? AND date = ?',
        [completed ? 1 : 0, habitId, date]
      );
    } else {
      await pool.run(
        'INSERT INTO habit_logs (habit_id, date, completed) VALUES (?, ?, ?)',
        [habitId, date, completed ? 1 : 0]
      );
    }

    const result = await pool.get(
      'SELECT * FROM habit_logs WHERE habit_id = ? AND date = ?',
      [habitId, date]
    );
    return result;
  }

  static async getForHabit(habitId, startDate, endDate) {
    const result = await pool.all(
      'SELECT * FROM habit_logs WHERE habit_id = ? AND date BETWEEN ? AND ? ORDER BY date ASC',
      [habitId, startDate, endDate]
    );
    return result;
  }

  static async getForUser(userId, startDate, endDate) {
    const result = await pool.all(
      `SELECT hl.*, h.name, h.category, h.color, h.difficulty_weight
       FROM habit_logs hl
       JOIN habits h ON hl.habit_id = h.id
       WHERE h.user_id = ? AND hl.date BETWEEN ? AND ?
       ORDER BY hl.date DESC`,
      [userId, startDate, endDate]
    );
    return result;
  }

  static async getCompletedCount(userId, date) {
    const result = await pool.get(
      `SELECT COUNT(*) as count FROM habit_logs hl
       JOIN habits h ON hl.habit_id = h.id
       WHERE h.user_id = ? AND hl.date = ? AND hl.completed = 1`,
      [userId, date]
    );
    return result?.count || 0;
  }

  static async getTotalHabits(userId) {
    const result = await pool.get(
      'SELECT COUNT(*) as count FROM habits WHERE user_id = ?',
      [userId]
    );
    return result?.count || 0;
  }

  static async getCompletionPercentage(userId, date) {
    const completed = await this.getCompletedCount(userId, date);
    const total = await this.getTotalHabits(userId);
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  }
}

module.exports = HabitLog;
