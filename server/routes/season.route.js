const express = require('express');
const seasonCtrl = require('../controllers/season.controller');
const playerCtrl = require('../controllers/player.controller');

const router = express.Router();
const axios = require('axios')

module.exports = router;

router.post('/', createSeason);
router.get('/:id', getSeason);
router.get('/', getAllSeasons);

router.post('/team', createTeam);
router.put('/team', updateTeam);

router.post('/match', createMatch);
router.put('/match/:matchId', updateMatch);
router.delete('/match/:matchId', deleteMatch);

router.post('/player', createPlayer);
router.get('/:seasonId/player/:id', getPlayer);
router.get('/:seasonId/players', getAllPlayers);
router.get('/:seasonId/players/update-ranked-info/:apiKey', updateAllPlayersRankedInfo)

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

async function updateAllPlayersRankedInfo(req, res) {
  let seasonId = req.params.seasonId;
  let riotApiKey = req.params.apiKey;

  let allPlayers = await playerCtrl.getAllPlayers(seasonId);
  let playersRankedInfo = [];

  allPlayers = allPlayers.filter(x => x);
  allPlayers = allPlayers.map(player => player.toObject()).filter(x => x);

  let delay = 0;
  const delayIncrement = 1000;

  const promises = allPlayers.map(player => {
    delay += delayIncrement;
    return new Promise(resolve => setTimeout(resolve, delay)).then(() =>
        getRankedInfo(player, riotApiKey));
  });

  playersRankedInfo = await Promise.all(promises);
  playersRankedInfo = playersRankedInfo.map(accountInfo => accountInfo && accountInfo.data).filter(x => x);

  allPlayers.forEach(player => {
    playersRankedInfo.find(rankedData => {
      if (rankedData && rankedData.length) {
        const soloRank = rankedData.find(x => x.queueType === 'RANKED_SOLO_5x5');
        const flexRank = rankedData.find(x => x.queueType === 'RANKED_FLEX_SR');
        const summonerName = soloRank ? soloRank.summonerName : (flexRank ? flexRank.summonerName : "");

        if ((soloRank || flexRank) && summonerName.toLowerCase() === player.name.toLowerCase()) {
          player.soloRank = soloRank ? soloRank.tier + " " + soloRank.rank : null;
          player.flexRank = flexRank ? flexRank.tier + " " + flexRank.rank : null;
        }
      }
    });
  });

  return await Promise.all(allPlayers.map(async player => await playerCtrl.updatePlayer(player, seasonId))).then(() => {
    res.json({allPlayers});
  });
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

async function createMatch(req, res) {
  let match = await seasonCtrl.createMatch(req.body);

  res.json(match);
}

async function updateMatch(req, res) {
  let matchId = req.params.matchId;
  let match = await seasonCtrl.updateMatch(req.body, matchId);

  res.json(match);
}

async function deleteMatch(req, res) {
  let matchId = req.params.matchId;
  let match = await seasonCtrl.deleteMatch(req.body, matchId);

  res.json(match);
}

function createSeason(req, res) {
  let seasons = seasonCtrl.createSeason(req.body);
  res.json({ seasons });
}

async function getSeason(req, res) {
  let seasonId = req.params.id;
  let season = await seasonCtrl.getSeason(seasonId);
  let teams = await seasonCtrl.getTeams(seasonId);
  let players = await playerCtrl.getAllPlayers(seasonId);
  let matches = await seasonCtrl.getAllMatches(seasonId);

  matches = matches.map(match => match.toObject()).sort((match1, match2) => {
    const match1Date = new Date(`${match1.matchDate} ${match1.matchTime} ${match1.timeZone}`);
    const match2Date = new Date(`${match2.matchDate} ${match2.matchTime} ${match2.timeZone}`)

    return match1Date - match2Date;
  });

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

      const wonMatches = matches.filter(match => match.winningTeamId == team._id);
      const lostMatches = matches.filter(match => (match.teamOneId == team._id || match.teamTwoId == team._id) && match.winningTeamId && match.winningTeamId != team._id);

      team.wins = wonMatches.length;
      team.losses = lostMatches.length;
    }
  });

  season = season.toObject();
  season.teams = teams;
  season.players = players;
  season.matches = matches;

  res.json(season);
}

async function getAllSeasons(req, res) {
  let seasons = await seasonCtrl.getAllSeasons();
  res.json({ seasons });
}

const getRankedInfo = async (player, apiKey) => {
  try {
    let accountInfo;

    if (!player.riotAccountId) {
      let accountInfoApiUrl = `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${player.name}?api_key=${apiKey}`;
      let encodedUri = encodeURI(accountInfoApiUrl);

      accountInfo = await axios.get(encodedUri);
      player.riotAccountId = accountInfo && accountInfo.data ? accountInfo.data.id : '';
    }

    let rankedInfoApiUrl = `https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/${player.riotAccountId}?api_key=${apiKey}`;

    return await axios.get(rankedInfoApiUrl)
  } catch (error) {
    console.error(error)
  }
}
