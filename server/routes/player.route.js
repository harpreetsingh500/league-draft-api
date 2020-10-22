const express = require('express');
const playerCtrl = require('../controllers/player.controller');

const router = express.Router();
module.exports = router;

router.post('/', createPlayer);
router.get('/', getAllPlayers);
// router.get('/:id', findPlayer);

function createPlayer(req, res) {
  let savedPlayer = playerCtrl.createPlayer(req.body);
  res.json({ savedPlayer });
}

async function getAllPlayers(req, res) {
  let players = await playerCtrl.getAllPlayers();
  res.json({ players });
}
