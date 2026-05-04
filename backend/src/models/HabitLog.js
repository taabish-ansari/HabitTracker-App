const { supabaseAdmin } = require('../supabase');

const HabitLog = {
  async logCompletion(userId, habitId, date, completed) {
    const { data: existing } = await supabaseAdmin
      .from('habit_logs')
      .select('id')
      .eq('habit_id', habitId)
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (existing) {
      const { data, error } = await supabaseAdmin
        .from('habit_logs')
        .update({
          completed: completed === true || completed === 1,
          updated_at: new Date().toISOString(),
        })
        .eq('habit_id', habitId)
        .eq('user_id', userId)
        .eq('date', date)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabaseAdmin
        .from('habit_logs')
        .insert({
          user_id: userId,
          habit_id: habitId,
          date,
          completed: completed === true || completed === 1,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  async getForHabit(habitId, startDate, endDate) {
    const { data, error } = await supabaseAdmin
      .from('habit_logs')
      .select('*')
      .eq('habit_id', habitId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getForUser(userId, startDate, endDate) {
    const { data, error } = await supabaseAdmin
      .from('habit_logs')
      .select(`
        *,
        habits (id, name, category, color, difficulty_weight)
      `)
      .eq('habits.user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getCompletedCount(userId, date) {
    const { data, error: fetchError } = await supabaseAdmin
      .from('habit_logs')
      .select('id')
      .eq('date', date)
      .eq('completed', true)
      .eq('user_id', userId);

    if (fetchError) throw fetchError;
    return data?.length || 0;
  },

  async getTotalHabits(userId) {
    const { count, error } = await supabaseAdmin
      .from('habits')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;
    return count || 0;
  },

  async getCompletionPercentage(userId, date) {
    const completed = await this.getCompletedCount(userId, date);
    const total = await this.getTotalHabits(userId);
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  },
};

module.exports = HabitLog;
