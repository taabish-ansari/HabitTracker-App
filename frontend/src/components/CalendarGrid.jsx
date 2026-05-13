import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const CalendarGrid = ({ habits, logs, onToggleHabit, currentMonth, currentYear }) => {
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

  const days = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [currentYear, currentMonth]);

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === currentYear && today.getMonth() === currentMonth;
  const todayDate = today.getDate();

  const getDateString = (day) => {
    const month = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${currentYear}-${month}-${dayStr}`;
  };

  const isCompleted = (habitId, day) => {
    const key = `${habitId}-${getDateString(day)}`;
    return logs[key]?.completed || false;
  };

  const handleToggle = (habitId, day) => {
    const dateStr = getDateString(day);
    onToggleHabit(habitId, dateStr, !isCompleted(habitId, day));
  };

  // Calculate stats
  const totalHabits = habits.length;
  const completedCount = useMemo(() => {
    let count = 0;
    days.forEach((day) => {
      habits.forEach((habit) => {
        if (isCompleted(habit.id, day)) count++;
      });
    });
    return count;
  }, [days, habits, logs]);

  // Calculate daily stats
  const dailyStats = useMemo(() => {
    return days.map((day) => {
      let completed = 0;
      habits.forEach((habit) => {
        if (isCompleted(habit.id, day)) completed++;
      });
      const percentage = totalHabits > 0 ? Math.round((completed / totalHabits) * 100) : 0;
      return { day, completed, percentage };
    });
  }, [days, habits, logs]);

  // Calculate trend data for chart
  const trendData = useMemo(() => {
    return dailyStats.map((stat) => ({
      day: stat.day,
      completion: stat.percentage,
    }));
  }, [dailyStats]);

  // Get week structure as contiguous 7-day bands (Week 1, Week 2, ...)
  const getWeekStructure = () => {
    const weeks = [];
    let currentWeek = 1;
    let dayCount = 0;
    for (let i = 0; i < days.length; i++) {
      if (dayCount === 7) {
        currentWeek++;
        dayCount = 0;
      }
      weeks.push(currentWeek);
      dayCount++;
    }
    return weeks;
  };

  const weeks = getWeekStructure();
  const uniqueWeeks = [...new Set(weeks)];

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long' });
  const progressPercentage = totalHabits > 0 ? Math.round((completedCount / (totalHabits * days.length)) * 100) : 0;

  const weekdayLabel = (day) =>
    new Date(currentYear, currentMonth, day)
      .toLocaleDateString('en-US', { weekday: 'short' })
      .slice(0, 2);

  const completionByHabit = useMemo(() => {
    return habits.reduce((acc, habit) => {
      acc[habit.id] = days.reduce((sum, day) => (isCompleted(habit.id, day) ? sum + 1 : sum), 0);
      return acc;
    }, {});
  }, [habits, days, logs]);

  return (
    <div className="w-full space-y-6 pt-2">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200/80 dark:border-gray-800 overflow-hidden">
        {/* Spreadsheet-style month + metrics strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border-b border-gray-200 dark:border-gray-800">
          <div className="p-6 md:col-span-1 border-r border-gray-200 dark:border-gray-800">
            <p className="text-5xl font-light tracking-tight text-gray-900 dark:text-gray-100">{monthName}</p>
            <p className="mt-2 text-sm uppercase tracking-[0.28em] text-gray-500 dark:text-gray-400">Monthly planner</p>
          </div>
          <div className="p-6 border-r border-gray-200 dark:border-gray-800">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Number of habits</p>
            <p className="text-3xl mt-2 font-semibold text-gray-900 dark:text-gray-100">{totalHabits}</p>
          </div>
          <div className="p-6 border-r border-gray-200 dark:border-gray-800">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Completed habits</p>
            <p className="text-3xl mt-2 font-semibold text-gray-900 dark:text-gray-100">{completedCount}</p>
          </div>
          <div className="p-6">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Progress</p>
            <div className="mt-4 h-4 w-full rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 dark:from-emerald-500 dark:to-cyan-500 transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-sm mt-2 font-medium text-gray-700 dark:text-gray-300">{progressPercentage}%</p>
          </div>
        </div>

        {/* Spreadsheet body */}
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full min-w-[1100px] border-collapse text-sm">
            <tbody>
              <tr className="bg-gray-50 dark:bg-gray-800/60">
                <td className="min-w-56 p-3 font-semibold text-gray-700 dark:text-gray-300 border-r border-b border-gray-200 dark:border-gray-800 sticky left-0 bg-gray-50 dark:bg-gray-800/60 z-10">
                  habits
                </td>
                {uniqueWeeks.map((week) => {
                  const weekDaysCount = weeks.filter((w) => w === week).length;
                  return (
                    <td
                      key={`week-${week}`}
                      colSpan={weekDaysCount}
                      className="p-3 text-center font-semibold text-gray-600 dark:text-gray-300 border-b border-r border-gray-200 dark:border-gray-800"
                    >
                      Week {week}
                    </td>
                  );
                })}
              </tr>

              <tr className="bg-gray-50 dark:bg-gray-800/60">
                <td className="p-2 border-r border-b border-gray-200 dark:border-gray-800 sticky left-0 bg-gray-50 dark:bg-gray-800/60 z-10" />
                {days.map((day) => (
                  <td
                    key={`weekday-${day}`}
                    className="w-12 p-2 text-center text-[11px] font-medium text-gray-500 dark:text-gray-400 border-r border-b border-gray-200 dark:border-gray-800"
                  >
                    {weekdayLabel(day)}
                  </td>
                ))}
              </tr>

              <tr className="bg-white dark:bg-gray-900">
                <td className="p-2 border-r border-b border-gray-200 dark:border-gray-800 sticky left-0 bg-white dark:bg-gray-900 z-10" />
                {days.map((day) => (
                  <td
                    key={`daynum-${day}`}
                    className="w-12 p-2 text-center text-[11px] text-gray-500 dark:text-gray-400 border-r border-b border-gray-200 dark:border-gray-800"
                  >
                    {day}
                  </td>
                ))}
              </tr>

              {habits.map((habit) => (
                <tr key={habit.id}>
                  <td className="p-3 border-r border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky left-0 z-10">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block w-3 h-3 rounded-sm"
                        style={{ backgroundColor: habit.color }}
                      />
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[12rem]">
                        {habit.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                        {completionByHabit[habit.id] || 0}/{days.length}
                      </span>
                    </div>
                  </td>
                  {days.map((day) => {
                    const checked = isCompleted(habit.id, day);
                    return (
                      <td
                        key={`${habit.id}-${day}`}
                        className={`w-12 h-12 text-center border-r border-b border-gray-200 dark:border-gray-800 transition-colors ${
                          checked ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-white dark:bg-gray-900'
                        } ${isCurrentMonth && day === todayDate ? 'ring-2 ring-inset ring-emerald-400 dark:ring-emerald-500' : ''}`}
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-emerald-500 cursor-pointer"
                          checked={checked}
                          onChange={() => handleToggle(habit.id, day)}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}

              <tr className="bg-gray-50 dark:bg-gray-800/60">
                <td className="p-3 text-sm font-semibold text-gray-700 dark:text-gray-300 border-r border-b border-gray-200 dark:border-gray-800 sticky left-0 bg-gray-50 dark:bg-gray-800/60 z-10">
                  Progress
                </td>
                {dailyStats.map((stat) => (
                  <td
                    key={`percent-${stat.day}`}
                    className="p-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 border-r border-b border-gray-200 dark:border-gray-800"
                  >
                    {stat.percentage}%
                  </td>
                ))}
              </tr>

              <tr className="bg-gray-50 dark:bg-gray-800/60">
                <td className="p-3 text-sm font-semibold text-gray-700 dark:text-gray-300 border-r border-b border-gray-200 dark:border-gray-800 sticky left-0 bg-gray-50 dark:bg-gray-800/60 z-10">
                  Done
                </td>
                {dailyStats.map((stat) => (
                  <td
                    key={`count-${stat.day}`}
                    className="p-2 text-center text-xs text-gray-600 dark:text-gray-300 border-r border-b border-gray-200 dark:border-gray-800"
                  >
                    {stat.completed}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200/80 dark:border-gray-800 p-5">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.25} />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" domain={[0, 100]} />
            <Area
              type="monotone"
              dataKey="completion"
              stroke="#34d399"
              fill="url(#completionGradient)"
              strokeWidth={3}
              isAnimationActive
            />
            <defs>
              <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0.02} />
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CalendarGrid;
