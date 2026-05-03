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
    <div className="w-full space-y-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Spreadsheet-style month + metrics strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border-b border-gray-200 dark:border-gray-800">
          <div className="p-5 md:col-span-1 border-r border-gray-200 dark:border-gray-800">
            <p className="text-4xl font-light tracking-tight text-gray-900 dark:text-gray-100">{monthName}</p>
          </div>
          <div className="p-5 border-r border-gray-200 dark:border-gray-800">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Number of habits</p>
            <p className="text-2xl mt-1 font-semibold text-gray-900 dark:text-gray-100">{totalHabits}</p>
          </div>
          <div className="p-5 border-r border-gray-200 dark:border-gray-800">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Completed habits</p>
            <p className="text-2xl mt-1 font-semibold text-gray-900 dark:text-gray-100">{completedCount}</p>
          </div>
          <div className="p-5">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Progress</p>
            <div className="mt-3 h-4 w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div
                className="h-full bg-green-400 dark:bg-green-500 transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-sm mt-1 font-medium text-gray-700 dark:text-gray-300">{progressPercentage}%</p>
          </div>
        </div>

        {/* Spreadsheet body */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <tbody>
              <tr className="bg-gray-50 dark:bg-gray-800/60">
                <td className="min-w-52 p-2 font-semibold text-gray-700 dark:text-gray-300 border-r border-b border-gray-200 dark:border-gray-800">
                  habits
                </td>
                {uniqueWeeks.map((week) => {
                  const weekDaysCount = weeks.filter((w) => w === week).length;
                  return (
                    <td
                      key={`week-${week}`}
                      colSpan={weekDaysCount}
                      className="p-2 text-center font-semibold text-gray-600 dark:text-gray-300 border-b border-r border-gray-200 dark:border-gray-800"
                    >
                      Week {week}
                    </td>
                  );
                })}
              </tr>

              <tr className="bg-gray-50 dark:bg-gray-800/60">
                <td className="p-1 border-r border-b border-gray-200 dark:border-gray-800" />
                {days.map((day) => (
                  <td
                    key={`weekday-${day}`}
                    className="w-8 p-1 text-center text-[10px] font-medium text-gray-500 dark:text-gray-400 border-r border-b border-gray-200 dark:border-gray-800"
                  >
                    {weekdayLabel(day)}
                  </td>
                ))}
              </tr>

              <tr className="bg-white dark:bg-gray-900">
                <td className="p-1 border-r border-b border-gray-200 dark:border-gray-800" />
                {days.map((day) => (
                  <td
                    key={`daynum-${day}`}
                    className="w-8 p-1 text-center text-[10px] text-gray-500 dark:text-gray-400 border-r border-b border-gray-200 dark:border-gray-800"
                  >
                    {day}
                  </td>
                ))}
              </tr>

              {habits.map((habit) => (
                <tr key={habit.id}>
                  <td className="p-2 border-r border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky left-0 z-10">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-sm"
                        style={{ backgroundColor: habit.color }}
                      />
                      <span className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate max-w-[10rem]">
                        {habit.name}
                      </span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 ml-auto">
                        {completionByHabit[habit.id] || 0}/{days.length}
                      </span>
                    </div>
                  </td>
                  {days.map((day) => {
                    const checked = isCompleted(habit.id, day);
                    return (
                      <td
                        key={`${habit.id}-${day}`}
                        className={`w-8 h-8 text-center border-r border-b border-gray-200 dark:border-gray-800 ${
                          checked ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'
                        } ${isCurrentMonth && day === todayDate ? 'ring-1 ring-inset ring-green-400 dark:ring-green-500' : ''}`}
                      >
                        <input
                          type="checkbox"
                          className="w-3.5 h-3.5 accent-gray-700 dark:accent-gray-200 cursor-pointer"
                          checked={checked}
                          onChange={() => handleToggle(habit.id, day)}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}

              <tr className="bg-gray-50 dark:bg-gray-800/60">
                <td className="p-2 text-xs font-semibold text-gray-700 dark:text-gray-300 border-r border-b border-gray-200 dark:border-gray-800">
                  Progress
                </td>
                {dailyStats.map((stat) => (
                  <td
                    key={`percent-${stat.day}`}
                    className="p-1 text-center text-[10px] font-semibold text-gray-600 dark:text-gray-300 border-r border-b border-gray-200 dark:border-gray-800"
                  >
                    {stat.percentage}%
                  </td>
                ))}
              </tr>

              <tr className="bg-gray-50 dark:bg-gray-800/60">
                <td className="p-2 text-xs font-semibold text-gray-700 dark:text-gray-300 border-r border-b border-gray-200 dark:border-gray-800">
                  Done
                </td>
                {dailyStats.map((stat) => (
                  <td
                    key={`count-${stat.day}`}
                    className="p-1 text-center text-[10px] text-gray-600 dark:text-gray-300 border-r border-b border-gray-200 dark:border-gray-800"
                  >
                    {stat.completed}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 p-4">
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={trendData}>
            <CartesianGrid strokeDasharray="2 2" stroke="#d1d5db" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#9ca3af" />
            <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" domain={[0, 100]} />
            <Area
              type="monotone"
              dataKey="completion"
              stroke="#8fbf7f"
              fill="#d9e9d1"
              strokeWidth={2}
              isAnimationActive
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CalendarGrid;
