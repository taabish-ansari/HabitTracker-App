import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AnalyticsDashboard = ({ habits, logs }) => {
  const generateCompletionData = () => {
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      let completed = 0;
      let total = habits.length;
      
      habits.forEach(habit => {
        const key = `${habit.id}-${dateStr}`;
        if (logs[key]?.completed) {
          completed++;
        }
      });

      last30Days.push({
        date: dateStr.slice(5),
        completion: total > 0 ? Math.round((completed / total) * 100) : 0,
        completed,
        total,
      });
    }
    return last30Days;
  };

  const generateHabitStats = () => {
    return habits.map(habit => {
      let completed = 0;
      let streak = 0;

      // Get all logs for this habit
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const key = `${habit.id}-${dateStr}`;

        if (logs[key]?.completed) {
          completed++;
          if (i === 0 || (i > 0 && logs[`${habit.id}-${new Date(date.getTime() + 86400000).toISOString().split('T')[0]}`]?.completed)) {
            streak++;
          }
        }
      }

      return {
        name: habit.name,
        completed,
        missed: 30 - completed,
        streak: habit.current_streak || 0,
      };
    });
  };

  const completionData = generateCompletionData();
  const habitStats = generateHabitStats();
  const COLORS = ['#4CAF50', '#FF6B6B'];

  return (
    <div className="space-y-6">
      {/* Overall Completion Trend */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">30-Day Completion Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={completionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="date" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="completion" stroke="#4CAF50" name="Completion %" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Habit Completion Stats */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Habit Completion (Last 30 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={habitStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="name" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip />
            <Legend />
            <Bar dataKey="completed" stackId="a" fill="#4CAF50" name="Completed" />
            <Bar dataKey="missed" stackId="a" fill="#FF6B6B" name="Missed" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Streaks Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {habitStats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">{stat.name}</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Completed:</span>
                <span className="font-bold text-green-600 dark:text-green-400">{stat.completed}/30</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Current Streak:</span>
                <span className="font-bold text-orange-600 dark:text-orange-400">🔥 {stat.streak}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-green-500 dark:bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${(stat.completed / 30) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Key Insights */}
      <div className="bg-blue-50 dark:bg-blue-900 p-6 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">📊 Key Insights</h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>• Average completion rate: {Math.round(completionData.reduce((sum, d) => sum + d.completion, 0) / completionData.length)}%</li>
          <li>• Most completed habit: {habitStats.length > 0 ? habitStats.reduce((max, h) => h.completed > max.completed ? h : max).name : 'N/A'}</li>
          <li>• Best streak: {Math.max(...habitStats.map(h => h.streak), 0)} days</li>
          <li>• Consistency is key! Keep your streaks alive 🔥</li>
        </ul>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
