const supabase = require('../supabase');

const User = {
  async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, username, created_at')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async findByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
    return data || null;
  },

  async getStats(userId) {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || { user_id: userId, total_xp: 0, level: 1, total_completed: 0, total_habits: 0 };
  },

  async updateStats(userId, updates) {
    const { data, error } = await supabase
      .from('user_stats')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

module.exports = User;
