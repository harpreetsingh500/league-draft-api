const express = require('express');
const seasonCtrl = require('../controllers/season.controller');
const playerCtrl = require('../controllers/player.controller');

const router = express.Router();
module.exports = router;

router.post('/', createSeason);
router.get('/:id', getSeason);
router.get('/', getAllSeasons);

router.post('/team', createTeam);
router.put('/team', updateTeam);

router.post('/player', createPlayer);
router.get('/:seasonId/player/:id', getPlayer);
router.get('/:seasonId/players', getAllPlayers);

function createPlayer(req, res) {
  let savedPlayer = playerCtrl.createPlayer(req.body);
  res.json(savedPlayer);
}

async function getPlayer(req, res) {
  let player = await playerCtrl.findPlayer(req.params.id);
  res.json(player);
}

async function updatePlayer(req, res) {
  let player = await playerCtrl.updatePlayer(req.params.id);
  res.json(player);
}

async function getAllPlayers(req, res) {
  let noTeam = req.query.noTeam === 'true';
  let players = await playerCtrl.getAllPlayers(req.params.seasonId, noTeam);
  res.json({ players });
}

function createTeam(req, res) {
  let team = seasonCtrl.createTeam(req.body);
  res.json(team);
}

async function updateTeam(req, res) {
  let team = req.body;
  await seasonCtrl.updateTeam(req.body);
  let players = team.players;

  let savedPlayers = await Promise.all(players
    .map(async player => {
      return await playerCtrl.findPlayer(player, team.seasonId)
    }));

  savedPlayers = savedPlayers.filter(x => x);
  savedPlayers.forEach(player => player.teamId = team._id);

  return await Promise.all(savedPlayers.map(async x => await playerCtrl.updatePlayer(x, team.seasonId))).then(() => {
    savedPlayers.forEach(x => x.teamName = team.name);
    res.json({team, savedPlayers});
  });
}

function createSeason(req, res) {
  let seasons = seasonCtrl.createSeason(req.body);
  res.json({ seasons });
}

async function getSeason(req, res) {
  let season = await seasonCtrl.getSeason(req.params.id);
  let teams = await seasonCtrl.getTeams(req.params.id);
  let players = await playerCtrl.getAllPlayers(req.params.id);

  players = players.map(player => player.toObject());

  players.forEach(player => {
    const team = teams.find(team => team._id == player.teamId);

    if (team) {
      player.teamName = team.name;
    }
  });

  season = season.toObject();
  season.teams = teams;
  season.players = players;

  res.json(season);
}

async function getAllSeasons(req, res) {
  let seasons = await seasonCtrl.getAllSeasons();
  res.json({ seasons });
}
