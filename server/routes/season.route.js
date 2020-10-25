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

router.post('/game-result', saveGameResults)

function saveGameResults(req, res) {
  let gameResult = {
    name: "test",
    result: JSON.stringify(req.body)
  }
  let savedGameResult = seasonCtrl.saveGameResult(gameResult);
  res.json(savedGameResult);
}

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

async function createTeam(req, res) {
  let team = await seasonCtrl.createTeam(req.body);
  let teamPlayers = team.players;
  let allPlayers = await playerCtrl.getAllPlayers(team.seasonId);

  allPlayers = allPlayers.filter(x => x);
  allPlayers.forEach(player => {
    if (teamPlayers.includes(player.name)) {
      player.teamId = team._id;
    } else if (player.teamId === team._id) {
      player.teamId = null;
    }
  });

  return await Promise.all(allPlayers.map(async player => await playerCtrl.updatePlayer(player, team.seasonId))).then(() => {
    allPlayers.forEach(x => x.teamName = team.name);
    res.json({team});
  });
}

async function updateTeam(req, res) {
  let team = req.body;
  await seasonCtrl.updateTeam(req.body);
  let teamPlayers = team.players;
  let allPlayers = await playerCtrl.getAllPlayers(team.seasonId);

  allPlayers = allPlayers.filter(x => x);
  allPlayers.forEach(player => {
    if (teamPlayers.includes(player.name)) {
      player.teamId = team._id;
    } else if (player.teamId === team._id) {
      player.teamId = null;
    }
  });

  return await Promise.all(allPlayers.map(async player => await playerCtrl.updatePlayer(player, team.seasonId))).then(() => {
    allPlayers.forEach(x => x.teamName = team.name);
    res.json({team, allPlayers});
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

  teams = teams.map(team => team.toObject());
  teams.forEach(team => {
    if (team && team.players && team.players.length) {
      team.players = team.players.map(player => players.find(playerObj => playerObj.name === player)).filter(x => x);
    }
  })

  season = season.toObject();
  season.teams = teams;
  season.players = players;

  res.json(season);
}

async function getAllSeasons(req, res) {
  let seasons = await seasonCtrl.getAllSeasons();
  res.json({ seasons });
}
