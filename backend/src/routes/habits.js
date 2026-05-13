const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const Habit = require('../models/Habit');

router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { name, category, difficulty_weight, color } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }

    const parsedDifficulty = Number.parseFloat(difficulty_weight);
    const normalizedDifficulty = Number.isFinite(parsedDifficulty) ? Math.max(1, Math.round(parsedDifficulty)) : 1;

    const habit = await Habit.create(
      req.userId,
      name,
      category,
      normalizedDifficulty,
      color || '#4CAF50'
    );

    res.status(201).json(habit);
  } catch (err) {
    next(err);
  }
});

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const habits = await Habit.getWithStreaks(req.userId);
    res.json(habits);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    res.json(habit);
  } catch (err) {
    next(err);
  }
});

router.put('/reorder', authMiddleware, async (req, res, next) => {
  try {
    const { orderedIds } = req.body;

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return res.status(400).json({ error: 'orderedIds must be a non-empty array' });
    }

    const reordered = await Habit.reorder(req.userId, orderedIds);
    res.json(reordered);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { name, category, difficulty_weight, color } = req.body;
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    const parsedDifficulty = Number.parseFloat(difficulty_weight);
    const normalizedDifficulty = Number.isFinite(parsedDifficulty) ? Math.max(1, Math.round(parsedDifficulty)) : habit.difficulty_weight;

    const updated = await Habit.update(
      req.params.id,
      name || habit.name,
      category || habit.category,
      normalizedDifficulty,
      color || habit.color
    );

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    await Habit.delete(req.params.id);
    res.json({ message: 'Habit deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
