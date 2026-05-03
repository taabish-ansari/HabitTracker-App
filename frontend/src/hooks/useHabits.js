import { useState, useEffect } from 'react';
import { habitService, logService, gamificationService } from '../services/api';

export const useHabits = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHabits = async () => {
    setLoading(true);
    try {
      const response = await habitService.getHabits();
      setHabits(response.data);
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
      setHabits([...habits, response.data]);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateHabit = async (id, data) => {
    try {
      const response = await habitService.updateHabit(id, data);
      setHabits(habits.map(h => (h.id === id ? response.data : h)));
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteHabit = async (id) => {
    try {
      await habitService.deleteHabit(id);
      setHabits(habits.filter(h => h.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  return { habits, loading, error, addHabit, updateHabit, deleteHabit, fetchHabits };
};

export const useHabitLogs = (startDate, endDate) => {
  const [logs, setLogs] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const logHabit = async (habitId, date, completed) => {
    try {
      const response = await logService.logCompletion(habitId, date, completed);
      setLogs({
        ...logs,
        [`${habitId}-${date}`]: response.data,
      });
      return response.data;
    } catch (err) {
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
