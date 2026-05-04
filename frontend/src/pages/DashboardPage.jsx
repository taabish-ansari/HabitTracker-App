import React, { useState, useEffect } from 'react';
import CalendarGrid from '../components/CalendarGrid';
import HabitManager from '../components/HabitManager';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import GamificationPanel from '../components/GamificationPanel';
import { useHabits, useHabitLogs } from '../hooks/useHabits';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const DashboardPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState('calendar');
  const { habits, loading: habitsLoading, error: habitsError, addHabit, updateHabit, deleteHabit, fetchHabits } = useHabits();
  const { isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();

  // Get date range for current month
  const startDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
  const endDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${new Date(currentYear, currentMonth + 1, 0).getDate()}`;

  const { logs, logHabit, fetchLogs } = useHabitLogs(startDate, endDate);

  const handleAddHabit = async (formData) => {
    await addHabit(formData.name, formData.category, formData.difficulty_weight, formData.color);
  };

  const handleUpdateHabit = async (id, formData) => {
    await updateHabit(id, formData);
  };

  const handleDeleteHabit = async (id) => {
    await deleteHabit(id);
  };

  const handleToggleHabit = async (habitId, date, completed) => {
    try {
      await logHabit(habitId, date, completed);
    } catch (err) {
      console.error('Failed to log habit:', err);
    }
  };

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };


  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">🎯 HabitTracker</h1>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm opacity-90">Gamify Your Daily Habits</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition"
                  title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {isDark ? '☀️' : '🌙'}
                </button>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-300 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'calendar'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            📅 Calendar
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'analytics'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            📊 Analytics
          </button>
          <button
            onClick={() => setActiveTab('gamification')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'gamification'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            ⭐ Points
          </button>
        </div>

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="space-y-4">
            {/* Month Navigation - Compact */}
            <div className="flex justify-center items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg shadow">
              <button
                onClick={goToPreviousMonth}
                className="bg-gray-400 dark:bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-500 dark:hover:bg-gray-700 transition"
              >
                ← Previous
              </button>
              <button
                onClick={goToToday}
                className="bg-blue-500 dark:bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 dark:hover:bg-blue-700 transition"
              >
                Today
              </button>
              <button
                onClick={goToNextMonth}
                className="bg-gray-400 dark:bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-500 dark:hover:bg-gray-700 transition"
              >
                Next →
              </button>
            </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4 lg:mt-8">
                  <div className="lg:col-span-1 lg:sticky lg:top-6 self-start">
                    <HabitManager
                      habits={habits}
                      addHabit={handleAddHabit}
                      updateHabit={(id, data) => handleUpdateHabit(id, data)}
                      deleteHabit={handleDeleteHabit}
                      loading={habitsLoading}
                      error={habitsError}
                    />
                  </div>
                  <div className="lg:col-span-2 space-y-6">
                    <CalendarGrid
                      habits={habits}
                      logs={logs}
                      onToggleHabit={handleToggleHabit}
                      currentMonth={currentMonth}
                      currentYear={currentYear}
                    />
                  </div>
                </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && <AnalyticsDashboard habits={habits} logs={logs} />}

        {/* Gamification Tab */}
        {activeTab === 'gamification' && <GamificationPanel />}
      </div>
    </div>
  );
};

export default DashboardPage;
