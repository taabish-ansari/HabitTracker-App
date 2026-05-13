import React, { useState } from 'react';
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
  const [activePage, setActivePage] = useState('calendar');
  const { user, logout } = useAuth();
  const habitOrderStorageKey = user?.id ? `habit-order-${user.id}` : 'habit-order-guest';
  const { habits, loading: habitsLoading, error: habitsError, addHabit, updateHabit, deleteHabit, reorderHabits } = useHabits({ autoFetch: true, orderStorageKey: habitOrderStorageKey });
  const { isDark, toggleTheme } = useTheme();

  // Get date range for current month
  const startDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
  const endDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${new Date(currentYear, currentMonth + 1, 0).getDate()}`;

  const { logs, logHabit } = useHabitLogs(startDate, endDate);

  const handleAddHabit = async (name, category, difficulty_weight, color) => {
    await addHabit(name, category, difficulty_weight, color);
  };

  const handleUpdateHabit = async (id, formData) => {
    await updateHabit(id, formData);
  };

  const handleDeleteHabit = async (id) => {
    await deleteHabit(id);
  };

  const handleReorderHabits = async (orderedIds) => {
    await reorderHabits(orderedIds);
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

  const pageOrder = ['calendar', 'habits', 'analytics', 'points'];
  const pageTitles = {
    calendar: 'Calendar',
    habits: 'Habits',
    analytics: 'Analytics',
    points: 'Points',
  };

  const currentPageIndex = pageOrder.indexOf(activePage);
  const goToPreviousPage = () => {
    if (currentPageIndex > 0) {
      setActivePage(pageOrder[currentPageIndex - 1]);
    }
  };

  const goToNextPage = () => {
    if (currentPageIndex < pageOrder.length - 1) {
      setActivePage(pageOrder[currentPageIndex + 1]);
    }
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
        <div className="rounded-3xl border border-gray-200 bg-white/90 p-6 shadow-lg backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
          <div className="mb-6 flex flex-col gap-4 border-b border-gray-200 pb-5 dark:border-gray-800 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-600 dark:text-sky-400">
                {pageTitles[activePage]}
              </p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                {activePage === 'calendar' && 'Track daily progress'}
                {activePage === 'habits' && 'Add and manage habits'}
                {activePage === 'analytics' && 'Review your stats'}
                {activePage === 'points' && 'Check your points'}
              </h2>
            </div>

            <div className="flex items-center gap-2 self-start rounded-2xl bg-gray-100 px-2 py-2 dark:bg-gray-800">
              <button
                onClick={goToPreviousPage}
                disabled={currentPageIndex === 0}
                className="rounded-xl bg-gray-400 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-gray-600 dark:hover:bg-gray-500"
              >
                Previous
              </button>
              <div className="min-w-28 px-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">
                {currentPageIndex + 1} / {pageOrder.length}
              </div>
              <button
                onClick={goToNextPage}
                disabled={currentPageIndex === pageOrder.length - 1}
                className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-blue-600 dark:hover:bg-blue-500"
              >
                Next
              </button>
            </div>
          </div>

          {activePage === 'calendar' && (
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600 dark:text-blue-400">Calendar</p>
                <div className="hidden sm:flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow dark:bg-gray-800">
                  <button
                    onClick={goToPreviousMonth}
                    className="bg-gray-400 dark:bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-500 dark:hover:bg-gray-700 transition"
                  >
                    ← Previous Month
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
                    Next Month →
                  </button>
                </div>
              </div>

              <div className="sm:hidden flex justify-center items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg shadow">
                <button
                  onClick={goToPreviousMonth}
                  className="bg-gray-400 dark:bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-500 dark:hover:bg-gray-700 transition"
                >
                  ← Previous Month
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
                  Next Month →
                </button>
              </div>

              <CalendarGrid
                habits={habits}
                logs={logs}
                onToggleHabit={handleToggleHabit}
                currentMonth={currentMonth}
                currentYear={currentYear}
              />
            </section>
          )}

          {activePage === 'habits' && (
            <section>
              <HabitManager
                habits={habits}
                addHabit={handleAddHabit}
                updateHabit={(id, data) => handleUpdateHabit(id, data)}
                deleteHabit={handleDeleteHabit}
                reorderHabits={handleReorderHabits}
                loading={habitsLoading}
                error={habitsError}
              />
            </section>
          )}

          {activePage === 'analytics' && <AnalyticsDashboard habits={habits} logs={logs} />}

          {activePage === 'points' && <GamificationPanel />}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
