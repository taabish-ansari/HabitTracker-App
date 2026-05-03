const pool = require('../db');

class GameStats {
  static async addXP(userId, habitId, xpAmount) {
    const date = new Date().toISOString().split('T')[0];
    
    // Log XP
    await pool.run(
      'INSERT INTO xp_logs (user_id, habit_id, xp_earned, date) VALUES (?, ?, ?, ?)',
      [userId, habitId, xpAmount, date]
    );

    // Update user stats
    const userStats = await this.getUserStats(userId);
    const newTotalXP = (userStats?.total_xp || 0) + xpAmount;
    const newLevel = Math.floor(newTotalXP / 100) + 1;

    const existingStats = await pool.get('SELECT * FROM user_stats WHERE user_id = ?', [userId]);
    if (existingStats) {
      await pool.run(
        'UPDATE user_stats SET total_xp = ?, level = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
        [newTotalXP, newLevel, userId]
      );
    } else {
      await pool.run(
        'INSERT INTO user_stats (user_id, total_xp, level, total_completed, total_habits) VALUES (?, ?, ?, 0, 0)',
        [userId, newTotalXP, newLevel]
      );
    }

    return { xp: xpAmount, totalXP: newTotalXP, level: newLevel };
  }

  static async getUserStats(userId) {
    const result = await pool.get('SELECT * FROM user_stats WHERE user_id = ?', [userId]);
    return result;
  }

  static async updateStreaks(habitId) {
    const habit = await pool.get('SELECT user_id FROM habits WHERE id = ?', [habitId]);
    const userId = habit?.user_id;

    // Get last 2 days of logs
    const logs = await pool.all(
      `SELECT date, completed FROM habit_logs 
       WHERE habit_id = ? 
       ORDER BY date DESC 
       LIMIT 2`,
      [habitId]
    );

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const todayLog = logs.find(l => l.date === today);
    const yesterdayLog = logs.find(l => l.date === yesterday);

    if (!todayLog || !todayLog.completed) {
      // Reset streak if today not completed
      await pool.run('UPDATE streaks SET current_streak = 0 WHERE habit_id = ?', [habitId]);
      return;
    }

    if (yesterdayLog && yesterdayLog.completed) {
      // Increment streak
      const currentStreakData = await pool.get('SELECT current_streak FROM streaks WHERE habit_id = ?', [habitId]);
      const streak = (currentStreakData?.current_streak || 0) + 1;
      const longestStreakData = await pool.get('SELECT longest_streak FROM streaks WHERE habit_id = ?', [habitId]);
      const newLongestStreak = Math.max(longestStreakData?.longest_streak || 0, streak);
      
      await pool.run(
        'UPDATE streaks SET current_streak = ?, longest_streak = ?, last_completed_date = ? WHERE habit_id = ?',
        [streak, newLongestStreak, today, habitId]
      );

      // Check for badges
      this.checkStreakBadges(userId, habitId, streak);
    } else {
      // Start new streak
      await pool.run(
        'UPDATE streaks SET current_streak = 1, last_completed_date = ? WHERE habit_id = ?',
        [today, habitId]
      );
    }
  }

  static async checkStreakBadges(userId, habitId, streak) {
    const badges = [];

    if (streak === 7) {
      badges.push({ name: '7-day streak', type: 'streak' });
    }
    if (streak === 30) {
      badges.push({ name: '30-day streak', type: 'streak' });
    }
    if (streak === 100) {
      badges.push({ name: 'Century Master', type: 'streak' });
    }

    for (const badge of badges) {
      const existingBadge = await pool.get(
        'SELECT id FROM badges WHERE user_id = ? AND badge_name = ?',
        [userId, badge.name]
      );

      if (!existingBadge) {
        await pool.run(
          'INSERT INTO badges (user_id, badge_name, description, badge_type) VALUES (?, ?, ?, ?)',
          [userId, badge.name, `Achieved ${badge.name}`, badge.type]
        );
      }
    }
  }

  static async getBadges(userId) {
    const result = await pool.all(
      'SELECT badge_name, description, badge_type, earned_at FROM badges WHERE user_id = ? ORDER BY earned_at DESC',
      [userId]
    );
    return result;
  }

  static async getUserLeaderboard(limit = 10) {
    const result = await pool.all(
      `SELECT u.id, u.username, s.total_xp, s.level, s.total_completed
       FROM user_stats s
       JOIN users u ON s.user_id = u.id
       ORDER BY s.total_xp DESC
       LIMIT ?`,
      [limit]
    );
    return result;
  }
}

module.exports = GameStats;
