import React, { useState } from 'react';
import HabitForm from './HabitForm';

const HabitManager = ({
  habits = [],
  addHabit,
  updateHabit,
  deleteHabit,
  loading = false,
  error = null,
} = {}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const handleAddHabit = async (formData) => {
    try {
      await addHabit(formData.name, formData.category, formData.difficulty_weight, formData.color);
      setShowForm(false);
    } catch (err) {
      console.error('Failed to add habit:', err);
    }
  };

  const handleUpdateHabit = async (formData) => {
    try {
      await updateHabit(editingId, formData);
      setEditingId(null);
    } catch (err) {
      console.error('Failed to update habit:', err);
    }
  };

  const handleDeleteHabit = async (id) => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      try {
        await deleteHabit(id);
      } catch (err) {
        console.error('Failed to delete habit:', err);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading habits...</div>;
  }

  return (
    <div className="space-y-4">
      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800 shadow-sm dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">{error}</div>}

      {!showForm && !editingId ? (
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:translate-y-[-1px] hover:from-emerald-400 hover:to-teal-400"
        >
          ➕ Add New Habit
        </button>
      ) : null}

      {showForm && (
        <HabitForm
          onSubmit={handleAddHabit}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingId && (
        <HabitForm
          onSubmit={handleUpdateHabit}
          onCancel={() => setEditingId(null)}
          initialData={habits.find((h) => h.id === editingId)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
        {habits.map((habit) => (
          <div key={habit.id} className="rounded-2xl border border-gray-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/70">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full ring-2 ring-white/70 dark:ring-gray-900"
                  style={{ backgroundColor: habit.color }}
                />
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{habit.name}</h3>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {habit.category} • Weight: {habit.difficulty_weight}
              </p>
              {habit.current_streak > 0 && (
                <p className="mt-2 text-sm font-semibold text-orange-600 dark:text-orange-400">
                  🔥 {habit.current_streak} day streak
                </p>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setEditingId(habit.id)}
                className="rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteHabit(habit.id)}
                className="rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {habits.length === 0 && !showForm && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/80 px-5 py-8 text-center dark:border-gray-700 dark:bg-gray-800/50">
          <p className="mb-4 text-gray-600 dark:text-gray-400">No habits yet. Create your first habit!</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:translate-y-[-1px]"
          >
            Create First Habit
          </button>
        </div>
      )}
    </div>
  );
};

export default HabitManager;
