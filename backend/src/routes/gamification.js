const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const GameStats = require('../models/GameStats');

router.get('/stats', authMiddleware, async (req, res, next) => {
  try {
    const stats = await GameStats.getUserStats(req.userId);
    const badges = await GameStats.getBadges(req.userId);

    res.json({ stats, badges });
  } catch (err) {
    next(err);
  }
});

router.get('/leaderboard', async (req, res, next) => {
  try {
    const limit = req.query.limit || 10;
    const leaderboard = await GameStats.getUserLeaderboard(limit);
    res.json(leaderboard);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
