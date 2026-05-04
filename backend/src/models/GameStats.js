const { supabaseAdmin } = require('../supabase');

const GameStats = {
  async addXP(userId, habitId, xpAmount) {
    const date = new Date().toISOString().split('T')[0];

    // Log XP
    const { error: logError } = await supabaseAdmin
      .from('xp_logs')
      .insert({
        user_id: userId,
        habit_id: habitId,
        xp_earned: xpAmount,
      });

    if (logError) throw logError;

    // Update user stats
    const userStats = await this.getUserStats(userId);
    const newTotalXP = (userStats?.total_xp || 0) + xpAmount;
    const newLevel = Math.floor(newTotalXP / 100) + 1;

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('user_stats')
      .update({
        total_xp: newTotalXP,
        level: newLevel,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) throw updateError;

    return { xp: xpAmount, totalXP: newTotalXP, level: newLevel };
  },

  async getUserStats(userId) {
    const { data, error } = await supabaseAdmin
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || { user_id: userId, total_xp: 0, level: 1, total_completed: 0 };
  },

  async updateStreaks(habitId) {
    // Get habit and user
    const { data: habit, error: habitError } = await supabaseAdmin
      .from('habits')
      .select('user_id')
      .eq('id', habitId)
      .single();

    if (habitError) throw habitError;
    const userId = habit.user_id;

    // Get last 2 days of logs
    const { data: logs, error: logsError } = await supabaseAdmin
      .from('habit_logs')
      .select('date, completed')
      .eq('habit_id', habitId)
      .order('date', { ascending: false })
      .limit(2);

    if (logsError) throw logsError;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const todayLog = logs?.find(l => l.date === today);
    const yesterdayLog = logs?.find(l => l.date === yesterday);

    if (!todayLog || !todayLog.completed) {
      // Reset streak if today not completed
      await supabaseAdmin
        .from('streaks')
        .update({ current_streak: 0 })
        .eq('habit_id', habitId);
      return;
    }

    if (yesterdayLog && yesterdayLog.completed) {
      // Increment streak
      const { data: streakData } = await supabaseAdmin
        .from('streaks')
        .select('current_streak')
        .eq('habit_id', habitId)
        .single();

      const streak = (streakData?.current_streak || 0) + 1;

      await supabaseAdmin
        .from('streaks')
        .update({
          current_streak: streak,
          last_completed_date: today,
        })
        .eq('habit_id', habitId);

      // Check for badges
      await this.checkStreakBadges(userId, habitId, streak);
    } else {
      // Start new streak
      await supabaseAdmin
        .from('streaks')
        .update({
          current_streak: 1,
          last_completed_date: today,
        })
        .eq('habit_id', habitId);
    }
  },

  async checkStreakBadges(userId, habitId, streak) {
    const badges = [];

    if (streak === 7) {
      badges.push({ name: '7-day streak', type: 'streak', desc: 'Achieved a 7-day streak' });
    }
    if (streak === 30) {
      badges.push({ name: '30-day streak', type: 'streak', desc: 'Achieved a 30-day streak' });
    }
    if (streak === 100) {
      badges.push({ name: 'Century Master', type: 'streak', desc: 'Achieved a 100-day streak' });
    }

    for (const badge of badges) {
      const { data: existing } = await supabaseAdmin
        .from('badges')
        .select('id')
        .eq('user_id', userId)
        .eq('badge_name', badge.name)
        .single();

      if (!existing) {
        await supabaseAdmin
          .from('badges')
          .insert({
            user_id: userId,
            badge_name: badge.name,
            description: badge.desc,
          });
      }
    }
  },

  async getBadges(userId) {
    const { data, error } = await supabaseAdmin
      .from('badges')
      .select('badge_name, description, earned_at')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getUserLeaderboard(limit = 10) {
    const { data, error } = await supabaseAdmin
      .from('user_stats')
      .select(`
        *,
        users (id, username)
      `)
      .order('total_xp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data?.map(row => ({
      id: row.users.id,
      username: row.users.username,
      total_xp: row.total_xp,
      level: row.level,
      total_completed: row.total_completed,
    })) || [];
  },
};

module.exports = GameStats;
