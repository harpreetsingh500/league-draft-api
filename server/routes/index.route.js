const express = require('express');
const userRoutes = require('./user.route');
const authRoutes = require('./auth.route');
const seasonRoutes = require('./season.route');
const playerRoutes = require('./player.route');
const heroesRoutes = require('./he-heroes.route');

const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/season', seasonRoutes);
router.use('/player', playerRoutes);
router.use('/heroes', heroesRoutes);

module.exports = router;
