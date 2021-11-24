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

router.get('/match/:gameId', getMatch);
router.post('/match', createMatch);
router.put('/match/:matchId', updateMatch);
router.delete('/match/:matchId', deleteMatch);

router.post('/player', createPlayer);
router.post('/:seasonId/players', createPlayers);
router.get('/:seasonId/player/:id', getPlayer);
router.get('/:seasonId/players', getAllPlayers);
router.get('/:seasonId/players/update-ranked-info/:apiKey', updateAllPlayersRankedInfo)

router.get('/:id/stats', getSeasonStats);

router.post('/game-result', saveGameResults)
router.post('/get-and-save-tournament-codes/:seasonId', getAndSaveTournamentCodes)

async function getSeasonStats(req, res) {
  let seasonId = req.params.id;
  let allGames = await seasonCtrl.getAllGames(seasonId);
  let allGamesData = allGames.map(game => game.toObject()).filter(game => game.data).map(game => JSON.parse(game.data));
  let stats = [];

  if (allGamesData && allGamesData.length) {
    let playersWithHighestKda;
    let playersWithMostKills;
    let playersWithMostAssists;
    let playersWithMostDamage;
    let playersWithMostDamagePerMin;
    let playersWithMostGoldEarned;
    let playersWithMostGoldPerMin;
    let playersWithLargestKillingSpree;
    let playersWithMostCS;
    let playersWithHighestCSPerMin;
    let playersWithHighestVisionScore;
    let playersWithMostPinkWardsPlaced;
    let playersWithMostDamageTaken;
    let playersWithMostHealing;
    let playersWithLargestCriticalStrike;
    let playersWithMostTimeCCingOthers;

    allGamesData = allGamesData.map(game => {
      if (game && game.participants && game.participants.length && game.participantIdentities && game.participantIdentities.length) {
        const gameTime = game.gameDuration / 60;

        return game.participants.map(participant => {
          const participantInfo = game.participantIdentities.find(x => x.participantId === participant.participantId);

          return {
            gameId: game.gameId,
            participantName: participantInfo && participantInfo.player ? participantInfo.player.summonerName : '',
            championId: participant.championId,
            kda: ((participant.stats.kills + participant.stats.assists) / (participant.stats.deaths === 0 ? 1 : participant.stats.deaths)).toFixed(1),
            kills: participant.stats.kills,
            assists: participant.stats.assists,
            deaths: participant.stats.deaths,
            championDamage: participant.stats.totalDamageDealtToChampions,
            championDamagePerMin: (participant.stats.totalDamageDealtToChampions / gameTime).toFixed(1),
            goldEarned: participant.stats.goldEarned,
            goldEarnedPerMin: (participant.stats.goldEarned / gameTime).toFixed(1),
            largestKillingSpree: participant.stats.largestKillingSpree,
            totalMinionsKilled: participant.stats.totalMinionsKilled + participant.stats.neutralMinionsKilled,
            csPerMin: ((participant.stats.totalMinionsKilled + participant.stats.neutralMinionsKilled) / gameTime).toFixed(1),
            visionScore: participant.stats.visionScore,
            pinkWardsPlaced: participant.stats.visionWardsBoughtInGame,
            damageTaken: participant.stats.totalDamageTaken,
            healing: participant.stats.totalHeal,
            criticalStrike: participant.stats.largestCriticalStrike,
            timeCCingOthers: participant.stats.timeCCingOthers
          };
        });
      }
    }).flat();

    playersWithHighestKda = allGamesData.sort((a, b) => b.kda - a.kda).slice(0, 5);
    playersWithMostKills = allGamesData.sort((a, b) => b.kills - a.kills).slice(0, 5);
    playersWithMostAssists = allGamesData.sort((a, b) => b.assists - a.assists).slice(0, 5);
    playersWithMostDamage = allGamesData.sort((a, b) => b.championDamage - a.championDamage).slice(0, 5);
    playersWithMostDamagePerMin = allGamesData.sort((a, b) => b.championDamagePerMin - a.championDamagePerMin).slice(0, 5);
    playersWithMostGoldEarned = allGamesData.sort((a, b) => b.goldEarned - a.goldEarned).slice(0, 5);
    playersWithMostGoldPerMin = allGamesData.sort((a, b) => b.goldEarnedPerMin - a.goldEarnedPerMin).slice(0, 5);
    playersWithLargestKillingSpree = allGamesData.sort((a, b) => b.largestKillingSpree - a.largestKillingSpree).slice(0, 5);
    playersWithMostCS = allGamesData.sort((a, b) => b.totalMinionsKilled - a.totalMinionsKilled).slice(0, 5);
    playersWithHighestCSPerMin = allGamesData.sort((a, b) => b.csPerMin - a.csPerMin).slice(0, 5);
    playersWithHighestVisionScore = allGamesData.sort((a, b) => b.visionScore - a.visionScore).slice(0, 5);
    playersWithMostPinkWardsPlaced = allGamesData.sort((a, b) => b.pinkWardsPlaced - a.pinkWardsPlaced).slice(0, 5);
    playersWithMostDamageTaken = allGamesData.sort((a, b) => b.damageTaken - a.damageTaken).slice(0, 5);
    playersWithMostHealing = allGamesData.sort((a, b) => b.healing - a.healing).slice(0, 5);
    playersWithLargestCriticalStrike = allGamesData.sort((a, b) => b.criticalStrike - a.criticalStrike).slice(0, 5);
    playersWithMostTimeCCingOthers = allGamesData.sort((a, b) => b.timeCCingOthers - a.timeCCingOthers).slice(0, 5);

    stats.push({
      title: "Highest KDA  ",
      data: playersWithHighestKda.map(x => {
        return {
          gameId: x.gameId,
          score: x.kda,
          playerName: x.participantName,
          championName: x.championId ? getChampionNameByKey(x.championId, "en_US") : null,
        };
      }),
    });

    stats.push({
      title: "Most Kills",
      data: playersWithMostKills.map(x => {
        return {
          gameId: x.gameId,
          score: x.kills,
          playerName: x.participantName,
          championName: x.championId ? getChampionNameByKey(x.championId, "en_US") : null,
        };
      }),
    });

    stats.push({
      title: "Most Assists",
      data: playersWithMostAssists.map(x => {
        return {
          gameId: x.gameId,
          score: x.assists,
          playerName: x.participantName,
          championName: x.championId ? getChampionNameByKey(x.championId, "en_US") : null,
        };
      }),
    });

    stats.push({
      title: "Most Damage",
      data: playersWithMostDamage.map(x => {
        return {
          gameId: x.gameId,
          score: x.championDamage,
          playerName: x.participantName,
          championName: x.championId ? getChampionNameByKey(x.championId, "en_US") : null,
        };
      }),
    });

    stats.push({
      title: "Most Damage Per Min",
      data: playersWithMostDamagePerMin.map(x => {
        return {
          gameId: x.gameId,
          score: x.championDamagePerMin,
          playerName: x.participantName,
          championName: x.championId ? getChampionNameByKey(x.championId, "en_US") : null,
        };
      }),
    });

    stats.push({
      title: "Most Gold",
      data: playersWithMostGoldEarned.map(x => {
        return {
          gameId: x.gameId,
          score: x.goldEarned,
          playerName: x.participantName,
          championName: x.championId ? getChampionNameByKey(x.championId, "en_US") : null,
        };
      }),
    });

    stats.push({
      title: "Most Gold Per Min",
      data: playersWithMostGoldPerMin.map(x => {
        return {
          gameId: x.gameId,
          score: x.goldEarnedPerMin,
          playerName: x.participantName,
          championName: x.championId ? getChampionNameByKey(x.championId, "en_US") : null,
        };
      }),
    });

    stats.push({
      title: "Largest Killing Spree",
      data: playersWithLargestKillingSpree.map(x => {
        return {
          gameId: x.gameId,
          score: x.largestKillingSpree,
          playerName: x.participantName,
          championName: x.championId ? getChampionNameByKey(x.championId, "en_US") : null,
        };
      }),
    });

    stats.push({
      title: "Most CS",
      data: playersWithMostCS.map(x => {
        return {
          gameId: x.gameId,
          score: x.totalMinionsKilled,
          playerName: x.participantName,
          championName: x.championId ? getChampionNameByKey(x.championId, "en_US") : null,
        };
      }),
    });

    stats.push({
      title: "Most CS Per Min",
      data: playersWithHighestCSPerMin.map(x => {
        return {
          gameId: x.gameId,
          score: x.csPerMin,
          playerName: x.participantName,
          championName: x.championId ? getChampionNameByKey(x.championId, "en_US") : null,
        };
      }),
    });

    stats.push({
      title: "Highest Vision Score",
      data: playersWithHighestVisionScore.map(x => {
        return {
          gameId: x.gameId,
          score: x.visionScore,
          playerName: x.participantName,
          championName: x.championId ? getChampionNameByKey(x.championId, "en_US") : null,
        };
      }),
    });

    stats.push({
      title: "Most Pink Wards Bought",
      data: playersWithMostPinkWardsPlaced.map(x => {
        return {
          gameId: x.gameId,
          score: x.pinkWardsPlaced,
          playerName: x.participantName,
          championName: x.championId ? getChampionNameByKey(x.championId, "en_US") : null,
        };
      }),
    });

    stats.push({
      title: "Most Damage Taken",
      data: playersWithMostDamageTaken.map(x => {
        return {
          gameId: x.gameId,
          score: x.damageTaken,
          playerName: x.participantName,
          championName: x.championId ? getChampionNameByKey(x.championId, "en_US") : null,
        };
      }),
    });

    stats.push({
      title: "Most Healing",
      data: playersWithMostHealing.map(x => {
        return {
          gameId: x.gameId,
          score: x.healing,
          playerName: x.participantName,
          championName: x.championId ? getChampionNameByKey(x.championId, "en_US") : null,
        };
      }),
    });

    stats.push({
      title: "Largest Critical Strike",
      data: playersWithLargestCriticalStrike.map(x => {
        return {
          gameId: x.gameId,
          score: x.criticalStrike,
          playerName: x.participantName,
          championName: x.championId ? getChampionNameByKey(x.championId, "en_US") : null,
        };
      }),
    });

    stats.push({
      title: "Time CCing Others(seconds)",
      data: playersWithMostTimeCCingOthers.map(x => {
        return {
          gameId: x.gameId,
          score: x.timeCCingOthers,
          playerName: x.participantName,
          championName: x.championId ? getChampionNameByKey(x.championId, "en_US") : null,
        };
      }),
    });
  }
  
  res.json(stats);
}

async function saveGameResults(req, res) {
  let savedGameResult;

  if (req.body) {
    let tournamentCode = req.body.shortCode;
    let gameId = req.body.gameId;
    let gameResult = {
      tournamentCode,
      gameId,
      result: JSON.stringify(req.body)
    }

    let existingGameResult = await seasonCtrl.getGameResultByGameId(gameId);

    if (!existingGameResult) {
      savedGameResult = await seasonCtrl.saveGameResult(gameResult);
      gameData = (await getGameData(tournamentCode, gameId)).data;
      tournamentCodeObj = (await seasonCtrl.getTournamentCode(tournamentCode)).toObject();
  
      let gameInfo = {
        gameId: gameId,
        seasonId: tournamentCodeObj.seasonId,
        data: JSON.stringify(gameData)
      }
  
      await seasonCtrl.saveGame(gameInfo);
      let match = (await seasonCtrl.getMatchByTournamentCode(tournamentCode)).toObject();
  
      if (match && gameData) {
        let winningTeam = gameData.teams.find(team => team.win.toLowerCase() === 'win');
        let winningTeamId;
  
        if (winningTeam.teamId === 100) {
          winningTeamId = match.teamOneId;
        } else {
          winningTeamId = match.teamTwoId;
        }
  
        match.winningTeamId = winningTeamId;
        match.gameId = gameId;
  
        await seasonCtrl.updateMatch(match, match._id);
      }
    }
  }

  res.json(savedGameResult);
}

function createPlayer(req, res) {
  let savedPlayer = playerCtrl.createPlayer(req.body);
  res.json(savedPlayer);
}

async function createPlayers(req, res) {
  const players = req.body.players;

  players.forEach(player => player.seasonId = req.params.seasonId);

  return await Promise.all(players.map(async player => await playerCtrl.createPlayer(player))).then(() => {
    res.json({players});
  });
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

function getNftValue(nft) {
  var rareBackgrounds = ['Stitches', 'Bones', 'Bunnybot', 'Burgerbun', 'Headless', 'Cactus', 'Gamebun', 'Alien', 'Balloon', 'Blocky', 'Popular rodent', 'Icecream', 'Gold', 'Laser', 'Rainbow'];
  var rareBody = ['Stitches', 'Bones', 'Bunnybot', 'Burgerbun', 'Headless', 'Cactus', 'Gamebun', 'Alien', 'Balloon', 'Blocky', 'Popular rodent', 'Icecream', 'Gold', 'Cracked', 'Ice', 'Magma', 'Pinata', 'Acid', 'Wood', 'Robot', 'Zombie', 'Water'];
  var rareClothes = ['Stitches', 'Bones', 'Bunnybot', 'Burgerbun', 'Headless', 'Cactus', 'Gamebun', 'Alien', 'Balloon', 'Blocky', 'Popular rodent', 'Icecream', 'Coins', 'Kimono', 'Royal', 'Tux gold', 'Robot', 'Wizard', 'Pinata', 'Surgeon', 'Fancy jacket', 'Bat', 'Magic hat', 'Box', 'Jumpsuit'];
  var rareEyes = ['Stitches', 'Bones', 'Bunnybot', 'Burgerbun', 'Headless', 'Cactus', 'Gamebun', 'Alien', 'Balloon', 'Blocky', 'Popular rodent', 'Icecream', 'Laser', 'Robot', 'Censored', 'Monocle', 'Spiral glasses', '3d', 'Eyepatch', 'Surgeon', 'Fancy jacket', 'Bat', 'Magic hat', 'Box', 'Jumpsuit'];
  var rareMouth = ['Stitches', 'Bones', 'Bunnybot', 'Burgerbun', 'Headless', 'Cactus', 'Gamebun', 'Alien', 'Balloon', 'Blocky', 'Popular rodent', 'Icecream', 'Gas mask', 'Rose', 'Bubble pipe', 'Juice box'];
  var rareEar = ['Stitches', 'Bones', 'Bunnybot', 'Burgerbun', 'Headless', 'Cactus', 'Gamebun', 'Alien', 'Balloon', 'Blocky', 'Popular rodent', 'Icecream', 'Diamond ring', 'Sparkles', 'Music', 'Question', 'Flies', 'Plane', 'Belt', 'Tag'];
  var rareHat = ['Stitches', 'Bones', 'Bunnybot', 'Burgerbun', 'Headless', 'Cactus', 'Gamebun', 'Alien', 'Balloon', 'Blocky', 'Popular rodent', 'Icecream', 'Crown', 'Deer antlers', 'Astronaut', 'Halo', 'Tinfoil', 'Laurel', 'Snail', 'Wizard', 'Top hat', 'Pirate', 'Goggles', 'Ninja', 'Playbunny'];
  var isRareBackground = false;
  var isRareBunny = false;
  var isRareClothes = false;
  var isRareEyes = false;
  var isRareMouth = false;
  var isRareEar = false;
  var isRareHat = false;
  var value = 0;

  if (nft) {
    nft.attributes.forEach(nft => {
      switch (nft.traitType) {
        case "background": 
          isRareBackground = rareBackgrounds.includes(nft.value);
          value += nftMarketData.background[nft.value];
          break;
        case "bunny": 
          isRareBunny = rareBody.includes(nft.value);
          value += nftMarketData.bunny[nft.value];
          break;
        case "clothes": 
          isRareClothes = rareClothes.includes(nft.value);
          value += nftMarketData.clothes[nft.value];
          break;
        case "eyes": 
          isRareEyes = rareEyes.includes(nft.value);
          value += nftMarketData.eyes[nft.value];
          break;
        case "mouth": 
          isRareMouth = rareMouth.includes(nft.value);
          value += nftMarketData.mouth[nft.value];
          break;
        case "ear": 
          isRareEar = rareEar.includes(nft.value);
          value += nftMarketData.ear[nft.value];
          break;
        case "hat": 
          isRareHat = rareHat.includes(nft.value);
          value += nftMarketData.hat[nft.value];
          break;
      }
    });
  }
console.log(value)
  return value;
}

async function getRarestNfts() {
  var allNftApiCalls = [];
  var rareNftIds = [];

  let delay = 0;
  const delayIncrement = 10;

  for (var x = 9000; x <= 9500; x++) {
    let accountInfoApiUrl = `https://nft.pancakeswap.com/api/v1/collections/0x0a8901b0E25DEb55A87524f0cC164E9644020EBA/tokens/${x}`;
    let encodedUri = encodeURI(accountInfoApiUrl);
    delay += delayIncrement;
    allNftApiCalls.push(new Promise(resolve => setTimeout(resolve, delay))
    .then(() => axios.get(encodedUri))
    .catch(function(err) {
      console.log(err.message); // some coding error in handling happened
    }));
  }

  return Promise.all(allNftApiCalls).then(function(values) {
    const allNftData = values.map(x => x && x.data && x.data.data ? x.data.data : null)
      .filter(x => x)
      .filter(nft => getNftValue(nft) < 2500)
      .map(nft => nft.tokenId);

    console.log(allNftData);
  }).catch(function(err) {
    console.log(err.message); // some coding error in handling happened
  });
}

async function getMatch(req, res) {
  await getRarestNfts();

  let gameId = req.params.gameId;
  let match = await seasonCtrl.getMatch(gameId);

  if (!match) {
    res.status(404).send('Match Not found');
  }

  match = match.toObject();
  let teamOne = await seasonCtrl.getTeam(match.teamOneId);
  let teamTwo = await seasonCtrl.getTeam(match.teamTwoId);
  let game = await seasonCtrl.getGame(match.gameId);

  if (!game) {
    res.status(404).send('Game Not found');
  }

  let gameData = JSON.parse(game.data);
  let teamOneStats = [];
  let teamTwoStats = [];
  let teamOneGameData;
  let teamTwoGameData;
  const gameTime = gameData.gameDuration / 60;

  teamOneGameData = gameData.participants.slice(0, 5).map(participant => {
    const participantInfo = gameData.participantIdentities.find(x => x.participantId === participant.participantId);

    return {
      participantName: participantInfo && participantInfo.player ? participantInfo.player.summonerName : '',
      championId: participant.championId,
      kda: ((participant.stats.kills + participant.stats.assists) / (participant.stats.deaths === 0 ? 1 : participant.stats.deaths)).toFixed(1),
      kills: participant.stats.kills,
      assists: participant.stats.assists,
      deaths: participant.stats.deaths,
      championDamage: participant.stats.totalDamageDealtToChampions,
      championDamagePerMin: (participant.stats.totalDamageDealtToChampions / gameTime).toFixed(1),
      goldEarned: participant.stats.goldEarned,
      goldEarnedPerMin: (participant.stats.goldEarned / gameTime).toFixed(1),
      largestKillingSpree: participant.stats.largestKillingSpree,
      totalMinionsKilled: participant.stats.totalMinionsKilled + participant.stats.neutralMinionsKilled,
      csPerMin: ((participant.stats.totalMinionsKilled + participant.stats.neutralMinionsKilled) / gameTime).toFixed(1),
      visionScore: participant.stats.visionScore,
      pinkWardsPlaced: participant.stats.visionWardsBoughtInGame,
      damageTaken: participant.stats.totalDamageTaken,
      healing: participant.stats.totalHeal,
      criticalStrike: participant.stats.largestCriticalStrike,
      timeCCingOthers: participant.stats.timeCCingOthers
    };
  });

  teamTwoGameData = gameData.participants.slice(5, 10).map(participant => {
    const participantInfo = gameData.participantIdentities.find(x => x.participantId === participant.participantId);

    return {
      participantName: participantInfo && participantInfo.player ? participantInfo.player.summonerName : '',
      championId: participant.championId,
      kda: ((participant.stats.kills + participant.stats.assists) / (participant.stats.deaths === 0 ? 1 : participant.stats.deaths)).toFixed(1),
      kills: participant.stats.kills,
      assists: participant.stats.assists,
      deaths: participant.stats.deaths,
      championDamage: participant.stats.totalDamageDealtToChampions,
      championDamagePerMin: (participant.stats.totalDamageDealtToChampions / gameTime).toFixed(1),
      goldEarned: participant.stats.goldEarned,
      goldEarnedPerMin: (participant.stats.goldEarned / gameTime).toFixed(1),
      largestKillingSpree: participant.stats.largestKillingSpree,
      totalMinionsKilled: participant.stats.totalMinionsKilled + participant.stats.neutralMinionsKilled,
      csPerMin: ((participant.stats.totalMinionsKilled + participant.stats.neutralMinionsKilled) / gameTime).toFixed(1),
      visionScore: participant.stats.visionScore,
      pinkWardsPlaced: participant.stats.visionWardsBoughtInGame,
      damageTaken: participant.stats.totalDamageTaken,
      healing: participant.stats.totalHeal,
      criticalStrike: participant.stats.largestCriticalStrike,
      timeCCingOthers: participant.stats.timeCCingOthers
    };
  });

  teamOneStats.push({
    title: "KDA",
    data: teamOneGameData.map(x => {
      return {
        score: x.kda,
        playerName: x.participantName,
        championName: x.championId ? getChampionNameByKey(x.championId, "en_US") : null,
      };
    }).sort((a, b) => b.score - a.score),
  });
  
  teamOneStats.push({
    title: "Damage",
    data: teamOneGameData.map(x => {
      return {
        score: x.championDamage,
        playerName: x.participantName,
        championName: x.championId ? getChampionNameByKey(x.championId, "en_US") : null,
      };
    }).sort((a, b) => b.score - a.score),
  });

  teamOneStats.push({
    title: "Healing",
    data: teamOneGameData.map(x => {
      return {
        score: x.healing,
        playerName: x.participantName,
        championName: x.championId ? getChampionNameByKey(x.championId, "en_US") : null,
      };
    }).sort((a, b) => b.score - a.score),
  });

  teamOneStats.push({
    title: "Gold",
    data: teamOneGameData.map(x => {
      return {
        score: x.goldEarned,
        playerName: x.participantName,
        championName: x.championId ? getChampionNameByKey(x.championId, "en_US") : null,
      };
    }).sort((a, b) => b.score - a.score),
  });

  teamOneStats.push({
    title: "CS",
    data: teamOneGameData.map(x => {
      return {
        score: x.totalMinionsKilled,
        playerName: x.participantName,
        championName: x.championId ? getChampionNameByKey(x.championId, "en_US") : null,
      };
    }).sort((a, b) => b.score - a.score),
  });

  teamOneStats.push({
    title: "CS Per Min",
    data: teamOneGameData.map(x => {
      return {
        score: x.csPerMin,
        playerName: x.participantName,
        championName: x.championId ? getChampionNameByKey(x.championId, "en_US") : null,
      };
    }).sort((a, b) => b.score - a.score),
  });

  teamOneStats.push({
    title: "Vision Score",
    data: teamOneGameData.map(x => {
      return {
        score: x.visionScore,
        playerName: x.participantName,
        championName: x.championId ? getChampionNameByKey(x.championId, "en_US") : null,
      };
    }).sort((a, b) => b.score - a.score),
  });

  teamOneStats.push({
    title: "Pink Wards Bought",
    data: teamOneGameData.map(x => {
      return {
        score: x.pinkWardsPlaced,
        playerName: x.participantName,
        championName: x.championId ? getChampionNameByKey(x.championId, "en_US") : null,
      };
    }).sort((a, b) => b.score - a.score),
  });

  teamTwoStats.push({
    title: "KDA",
    data: teamTwoGameData.map(x => {
      return {
        score: x.kda,
        playerName: x.participantName,
        championName: x.championId ? getChampionNameByKey(x.championId, "en_US") : null,
      };
    }).sort((a, b) => b.score - a.score),
  });

  teamTwoStats.push({
    title: "Damage",
    data: teamTwoGameData.map(x => {
      return {
        score: x.championDamage,
        playerName: x.participantName,
        championName: x.championId ? getChampionNameByKey(x.championId, "en_US") : null,
      };
    }).sort((a, b) => b.score - a.score),
  });

  teamTwoStats.push({
    title: "Healing",
    data: teamTwoGameData.map(x => {
      return {
        score: x.healing,
        playerName: x.participantName,
        championName: x.championId ? getChampionNameByKey(x.championId, "en_US") : null,
      };
    }).sort((a, b) => b.score - a.score),
  });

  teamTwoStats.push({
    title: "Gold",
    data: teamTwoGameData.map(x => {
      return {
        score: x.goldEarned,
        playerName: x.participantName,
        championName: x.championId ? getChampionNameByKey(x.championId, "en_US") : null,
      };
    }).sort((a, b) => b.score - a.score),
  });

  teamTwoStats.push({
    title: "CS",
    data: teamTwoGameData.map(x => {
      return {
        score: x.totalMinionsKilled,
        playerName: x.participantName,
        championName: x.championId ? getChampionNameByKey(x.championId, "en_US") : null,
      };
    }).sort((a, b) => b.score - a.score),
  });

  teamTwoStats.push({
    title: "CS Per Min",
    data: teamTwoGameData.map(x => {
      return {
        score: x.csPerMin,
        playerName: x.participantName,
        championName: x.championId ? getChampionNameByKey(x.championId, "en_US") : null,
      };
    }).sort((a, b) => b.score - a.score),
  });

  teamTwoStats.push({
    title: "Vision Score",
    data: teamTwoGameData.map(x => {
      return {
        score: x.visionScore,
        playerName: x.participantName,
        championName: x.championId ? getChampionNameByKey(x.championId, "en_US") : null,
      };
    }).sort((a, b) => b.score - a.score),
  });

  teamTwoStats.push({
    title: "Pink Wards Bought",
    data: teamTwoGameData.map(x => {
      return {
        score: x.pinkWardsPlaced,
        playerName: x.participantName,
        championName: x.championId ? getChampionNameByKey(x.championId, "en_US") : null,
      };
    }).sort((a, b) => b.score - a.score),
  });

  match.teamOneName = teamOne.toObject().name;
  match.teamTwoName = teamTwo.toObject().name;
  match.teameOneStats = teamOneStats;
  match.teamTwoStats = teamTwoStats;

  res.json(match)
}

async function createMatch(req, res) {
  let match = (await seasonCtrl.createMatch(req.body)).toObject();

  if (match) {
    let tournamentCodeObj = (await seasonCtrl.getAvailableTournamentCode(match.seasonId)).toObject();

    if (tournamentCodeObj) {
      tournamentCodeObj.matchId = match._id;
      match.tournamentCode = tournamentCodeObj.tournamentCode;

      await seasonCtrl.updateTournamentCode(tournamentCodeObj._id, tournamentCodeObj);
      await seasonCtrl.updateMatch(match, match._id);
    }
  }

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

    return match2Date - match1Date;
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

async function getAndSaveTournamentCodes(req, res) {
  // get tournament codes here
  let seasonId = req.params.seasonId;
  let tournamentCodes = req.body.tournamentCodes;
  
  if (seasonId && tournamentCodes && tournamentCodes.length) {
    tournamentCodes = tournamentCodes.map(tournamentCode => {
      return {
        seasonId,
        tournamentCode,
      }
    });
  
    return await Promise.all(tournamentCodes.map(async tournamentCode => await seasonCtrl.saveTournamentCode(tournamentCode))).then((result) => {
      res.json({result});
    });
  } else {
    res.json({});
  }
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

const getGameData = async (tournamentCode, gameId) => {
  try {
    let gameDataApiUrl = `https://na1.api.riotgames.com/lol/match/v4/matches/${gameId}/by-tournament-code/${tournamentCode}?api_key=${riotApiKey}`;
    let encodedUri = encodeURI(gameDataApiUrl);

    return await axios.get(encodedUri);
  } catch (error) {
    console.error(error)
  }
}

let championByIdCache = {};
let championJson = {};

async function getLatestChampionDDragon(language = "en_US") {
  if (championJson[language])
    return championJson[language];

  const version = (await axios.get("https://ddragon.leagueoflegends.com/api/versions.json")).data[0];
  const response = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${version}/data/${language}/champion.json`);

  const json = response.data;
  championJson[language] = json

  // Setup cache
  championByIdCache[language] = {};
  for (var championName in json.data) {
    if (!json.data.hasOwnProperty(championName))
      continue;

    const champInfo = json.data[championName];
    championByIdCache[language][champInfo.key] = champInfo;
  }
}

function getChampionNameByKey(key, language = "en_US") {
  if (championByIdCache[language] && championByIdCache[language][key]) {
   return championByIdCache[language][key]['id'];
  }
}

async function getChampionData() {
  await getLatestChampionDDragon();
}

function isHEHeroPriceLow(heroes, heroName, heroPrice) {
  if (heroes && heroes.length && heroName && heroPrice) {
    const allHeroPrices = heroes.filter(hero => hero.name === heroName && hero.sale)
          .map(hero => hero.sale.price)
    const firstFive =  allHeroPrices
          .slice(0, 5)
          .sort();
    const priceAverage = firstFive.reduce((a, b) => a + b) / 5;
    
    return heroPrice < priceAverage;
  }
}

async function getHEListings() {
  const allHeroes = [];
  const championArray = [];

  allHeroes.push(...await getHEHeroes('Rare%2B'));
  allHeroes.push(...await getHEHeroes('Epic'));
  allHeroes.push(...await getHEHeroes('Epic%2B'));
  allHeroes.push(...await getHEHeroes('Legendary'));
  allHeroes.push(...await getHEHeroes('Legendary%2B'));
  allHeroes.push(...await getHEHeroes('Immortal'));
  allHeroes.push(...await getHEHeroes('Immortal%2B'));
  allHeroes.push(...await getHEHeroes('Ultimate'));

  allHeroes.forEach((champ) => {
    if(champ.sale) {
      let saleStartTime = new Date(champ.sale.startTime);
      let currentTime = new Date(new Date() - 600000);
      if(saleStartTime > currentTime && isHEHeroPriceLow(allHeroes, champ.name, champ.sale.price)) {
          championArray.push({
              champName: champ.name,
              champPrice: champ.sale.price,
              champId: champ.id,
              champAddress: `https://meta.heroesempires.com/en/stats/${champ.tokenId}`,
              champRarity: '',
              champBuy: `<https://market.heroesempires.com/market/${champ.id}>`
          })
      };
    }
  });
  let discordPosting = [`=====For Sale=====Trademark of Kob`];

  for(let newChampNum = 0;newChampNum < championArray.length;newChampNum++) {
    let res = await axios.get(championArray[newChampNum].champAddress);
    let curChamp = res.data;
    championArray[newChampNum].champRarity = curChamp.Tier;
    console.log(championArray[newChampNum].isPriceLow)
    discordPosting.push(championArray[newChampNum].champRarity.toUpperCase() + ' ' + championArray[newChampNum].champName + ' is on sale for ' + championArray[newChampNum].champPrice + '. Buy at: ' + championArray[newChampNum].champBuy);
};

  for(let champRange = 0;champRange < championArray.length;champRange+=5) {
    setTimeout(() => {
        if(discordPosting) {
          const data = JSON.stringify({username: 'HE Price Bot', content: discordPosting.slice(champRange, champRange+5).join('\n')});
          console.log(data);
          axios.post('https://discord.com/api/webhooks/912556901408067654/n_Cw7aNE9yy4s5UbZfehuAGxqhM5YiSEmV8Gj7bqBlity7RZ3fUKCSIMd-a4vasM6ngV', data, {
            headers: {
                'Content-Type': 'application/json',
            }
        })
          .then((res) => {
              console.log(`Status: ${res.status}`);
              console.log('Body: ', res.data);
          }).catch((err) => {
              console.error(err);
          });
    }}, champRange*300);
}

}

async function getHEHeroes(rarity) {
  const response = await axios.get(`https://marketplace-api.heroesempires.com/sale-items?class&desc=false&listedOnMarket=true&maxPrice&minPrice&orderBy=price&page=1&race&search=&size=3000&tier=${rarity}`);

  return response.data.data.items;
}

getChampionData();
getHEListings();

setInterval(function(){ 
  getHEListings();
}, 1000 * 60 * 10);

let riotApiKey = 'RGAPI-5663a1ea-1caa-497a-a98b-eaefa8cb614f';
let riotTournamentProviderId = '12298';
let riotTournamentId = '1870940';
