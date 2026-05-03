import React, { useState } from 'react';
import { useHabits } from '../hooks/useHabits';
import HabitForm from './HabitForm';

const HabitManager = () => {
  const { habits, addHabit, updateHabit, deleteHabit, loading, error } = useHabits();
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
      {error && <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-3 rounded">{error}</div>}

      {!showForm && !editingId ? (
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-500 dark:bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-600 dark:hover:bg-green-700 transition"
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {habits.map((habit) => (
          <div key={habit.id} className="habit-card">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: habit.color }}
                />
                <h3 className="font-semibold">{habit.name}</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {habit.category} • Weight: {habit.difficulty_weight}
              </p>
              {habit.current_streak > 0 && (
                <p className="text-sm text-orange-600 dark:text-orange-400 font-semibold mt-1">
                  🔥 {habit.current_streak} day streak
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingId(habit.id)}
                className="bg-blue-500 dark:bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 dark:hover:bg-blue-700"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteHabit(habit.id)}
                className="bg-red-500 dark:bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-600 dark:hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {habits.length === 0 && !showForm && (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No habits yet. Create your first habit!</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-500 dark:bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-600 dark:hover:bg-green-700 transition"
          >
            Create First Habit
          </button>
        </div>
      )}
    </div>
  );
};

export default HabitManager;
