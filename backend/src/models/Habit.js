const { supabaseAdmin } = require('../supabase');

const Habit = {
  async create(userId, name, category, difficulty_weight, color) {
    const { data, error } = await supabaseAdmin
      .from('habits')
      .insert({
        user_id: userId,
        name,
        category,
        difficulty_weight,
        color,
      })
      .select()
      .single();

    if (error) throw error;

    // Create streak entry for the new habit
    const streakPayloads = [
      {
        habit_id: data.id,
        current_streak: 0,
        best_streak: 0,
      },
      {
        habit_id: data.id,
        current_streak: 0,
        longest_streak: 0,
      },
    ];

    let streakError = null;
    for (const payload of streakPayloads) {
      const { error: insertError } = await supabaseAdmin
        .from('streaks')
        .insert(payload);

      if (!insertError) {
        streakError = null;
        break;
      }

      streakError = insertError;
    }

    if (streakError) throw streakError;

    return data;
  },

  async findByUserId(userId) {
    const { data, error } = await supabaseAdmin
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async findById(id) {
    const { data, error } = await supabaseAdmin
      .from('habits')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, name, category, difficulty_weight, color) {
    const { data, error } = await supabaseAdmin
      .from('habits')
      .update({
        name,
        category,
        difficulty_weight,
        color,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabaseAdmin
      .from('habits')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  async getWithStreaks(userId) {
    const { data, error } = await supabaseAdmin
      .from('habits')
      .select(`
        *,
        streaks (
          id,
          current_streak,
          last_completed_date
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};

module.exports = Habit;
