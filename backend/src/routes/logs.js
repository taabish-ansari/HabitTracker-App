const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const HabitLog = require('../models/HabitLog');
const GameStats = require('../models/GameStats');
const Habit = require('../models/Habit');

router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { habitId, date, completed } = req.body;

    if (!habitId || !date) {
      return res.status(400).json({ error: 'Habit ID and date are required' });
    }

    const log = await HabitLog.logCompletion(habitId, date, completed);

    // Award XP if completed
    if (completed) {
      const habit = await Habit.findById(habitId);
      const xpEarned = habit.difficulty_weight * 10; // 10 XP per difficulty point
      await GameStats.addXP(req.userId, habitId, xpEarned);
      await GameStats.updateStreaks(habitId);
    }

    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
});

router.get('/user/:userId', authMiddleware, async (req, res, next) => {
  try {
    const startDate = req.query.startDate || new Date().toISOString().split('T')[0];
    const endDate = req.query.endDate || new Date().toISOString().split('T')[0];

    const logs = await HabitLog.getForUser(req.userId, startDate, endDate);
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

router.get('/habit/:habitId', authMiddleware, async (req, res, next) => {
  try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const logs = await HabitLog.getForHabit(req.params.habitId, startDate, endDate);
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

router.get('/stats/daily/:date', authMiddleware, async (req, res, next) => {
  try {
    const completed = await HabitLog.getCompletedCount(req.userId, req.params.date);
    const total = await HabitLog.getTotalHabits(req.userId);
    const percentage = await HabitLog.getCompletionPercentage(req.userId, req.params.date);

    res.json({ date: req.params.date, completed, total, percentage });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
