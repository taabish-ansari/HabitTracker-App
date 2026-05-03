const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const GameStats = require('../models/GameStats');

router.post('/register', async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, username, and password are required' });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const user = await User.create(email, username, password);

    // Initialize user stats
    const pool = require('../db');
    await pool.query(
      'INSERT INTO user_stats (user_id, total_xp, level, total_completed, total_habits) VALUES ($1, 0, 1, 0, 0)',
      [user.id]
    );

    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await User.verifyPassword(user.password, password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me', require('../middleware/auth').authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    const stats = await GameStats.getUserStats(req.userId);
    const badges = await GameStats.getBadges(req.userId);

    res.json({ user, stats, badges });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
