import { useState, useEffect } from 'react';
import { habitService, logService, gamificationService } from '../services/api';

export const useHabits = ({ autoFetch = true, orderStorageKey = 'habit-order' } = {}) => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getStoredOrder = () => {
    if (typeof window === 'undefined') return [];

    try {
      return JSON.parse(window.localStorage.getItem(orderStorageKey) || '[]');
    } catch {
      return [];
    }
  };

  const saveStoredOrder = (orderedIds) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(orderStorageKey, JSON.stringify(orderedIds));
  };

  const sortHabits = (habitList) => {
    const storedOrder = getStoredOrder();

    if (!storedOrder.length) {
      return habitList;
    }

    const habitMap = new Map(habitList.map((habit) => [habit.id, habit]));
    const orderedHabits = storedOrder.map((id) => habitMap.get(id)).filter(Boolean);
    const remainingHabits = habitList.filter((habit) => !storedOrder.includes(habit.id));
    return [...orderedHabits, ...remainingHabits];
  };

  const fetchHabits = async () => {
    setLoading(true);
    try {
      const response = await habitService.getHabits();
      setHabits(sortHabits(response.data));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addHabit = async (name, category, difficulty_weight, color) => {
    try {
      const response = await habitService.createHabit(name, category, difficulty_weight, color);
      setHabits((prevHabits) => {
        const nextHabits = [...prevHabits, response.data];
        const ordered = sortHabits(nextHabits);
        saveStoredOrder(ordered.map((habit) => habit.id));
        return ordered;
      });
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateHabit = async (id, data) => {
    try {
      const response = await habitService.updateHabit(id, data);
      setHabits((prevHabits) => prevHabits.map((habit) => (habit.id === id ? response.data : habit)));
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteHabit = async (id) => {
    try {
      await habitService.deleteHabit(id);
      setHabits((prevHabits) => {
        const nextHabits = prevHabits.filter((habit) => habit.id !== id);
        saveStoredOrder(nextHabits.map((habit) => habit.id));
        return nextHabits;
      });
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const reorderHabits = async (orderedIds) => {
    try {
      saveStoredOrder(orderedIds);
      setHabits((prevHabits) => {
        const habitMap = new Map(prevHabits.map((habit) => [habit.id, habit]));
        const reordered = orderedIds.map((id) => habitMap.get(id)).filter(Boolean);
        const remaining = prevHabits.filter((habit) => !orderedIds.includes(habit.id));
        return [...reordered, ...remaining];
      });
      setError(null);
      return orderedIds;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchHabits();
    }
  }, [autoFetch, orderStorageKey]);

  return { habits, loading, error, addHabit, updateHabit, deleteHabit, reorderHabits, fetchHabits };
};

export const useHabitLogs = (startDate, endDate) => {
  const [logs, setLogs] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const logHabit = async (habitId, date, completed) => {
    const logKey = `${habitId}-${date}`;
    const previousLog = logs[logKey];
    const optimisticLog = {
      ...(previousLog || {}),
      habit_id: habitId,
      date,
      completed: completed === true || completed === 1,
    };

    setLogs((prevLogs) => ({
      ...prevLogs,
      [logKey]: optimisticLog,
    }));

    try {
      const response = await logService.logCompletion(habitId, date, completed);
      setLogs((prevLogs) => ({
        ...prevLogs,
        [`${habitId}-${date}`]: response.data,
      }));
      return response.data;
    } catch (err) {
      setLogs((prevLogs) => {
        const nextLogs = { ...prevLogs };
        if (previousLog) {
          nextLogs[logKey] = previousLog;
        } else {
          delete nextLogs[logKey];
        }
        return nextLogs;
      });
      setError(err.message);
      throw err;
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await logService.getLogs(startDate, endDate);
      const logMap = {};
      response.data.forEach(log => {
        logMap[`${log.habit_id}-${log.date}`] = log;
      });
      setLogs(logMap);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchLogs();
    }
  }, [startDate, endDate]);

  return { logs, loading, error, logHabit, fetchLogs };
};

export const useGameStats = () => {
  const [stats, setStats] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await gamificationService.getStats();
      setStats(response.data.stats);
      setBadges(response.data.badges);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, badges, loading, error, fetchStats };
};
