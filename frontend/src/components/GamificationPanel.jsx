import React, { useState } from 'react';
import { useGameStats } from '../hooks/useHabits';

const GamificationPanel = () => {
  const { stats, badges, loading, error } = useGameStats();

  if (loading) {
    return <div className="text-center py-4 text-gray-900 dark:text-white">Loading stats...</div>;
  }

  if (error) {
    return <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-3 rounded">{error}</div>;
  }

  const xpToNextLevel = 100 - (stats?.total_xp % 100 || 0);
  const progressToNextLevel = ((stats?.total_xp % 100) / 100) * 100;

  return (
    <div className="space-y-6">
      {/* Level and XP */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-700 dark:to-pink-700 text-white p-8 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold">Level {stats?.level || 1}</h2>
            <p className="text-lg opacity-90 mt-2">XP: {Math.floor(stats?.total_xp || 0)}</p>
          </div>
          <div className="text-6xl">⭐</div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between mb-2 text-sm">
            <span>Progress to Next Level</span>
            <span>{xpToNextLevel} XP needed</span>
          </div>
          <div className="w-full bg-white bg-opacity-30 rounded-full h-4">
            <div
              className="bg-white h-4 rounded-full transition-all duration-300"
              style={{ width: `${progressToNextLevel}%` }}
            />
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">🏆 Badges Earned</h3>
        {badges.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {badges.map((badge, idx) => (
              <div key={idx} className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg text-center border-2 border-yellow-300 dark:border-yellow-700">
                <div className="text-3xl mb-2">🎖️</div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{badge.badge_name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{badge.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            No badges yet. Keep completing habits to earn badges! 🎯
          </p>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg border-l-4 border-green-500 dark:border-green-600">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Completions</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats?.total_completed || 0}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg border-l-4 border-blue-500 dark:border-blue-600">
          <p className="text-sm text-gray-600 dark:text-gray-400">Active Habits</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats?.total_habits || 0}</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg border-l-4 border-purple-500 dark:border-purple-600">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total XP</p>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{Math.floor(stats?.total_xp || 0)}</p>
        </div>
      </div>

      {/* Achievement Tips */}
      <div className="bg-gradient-to-r from-orange-50 dark:from-orange-900 to-red-50 dark:to-red-900 p-6 rounded-lg border-l-4 border-orange-500 dark:border-orange-600">
        <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">💡 Achievement Tips</h4>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>✓ Complete habits daily to build streaks</li>
          <li>✓ Higher difficulty habits earn more XP</li>
          <li>✓ Reach 7, 30, and 100-day streaks for badges</li>
          <li>✓ Perfect weeks earn special recognition</li>
        </ul>
      </div>
    </div>
  );
};

export default GamificationPanel;
