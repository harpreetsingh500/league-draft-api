const Player = require('../models/player.model');
const Joi = require('joi');
module.exports = {
  createPlayer,
  findPlayer,
  getAllPlayers,
  updatePlayer
}

const playerSchema = Joi.object({
  name: Joi.string().required(),
  seasonId: Joi.string().required(),
  teamId: Joi.string(),
  primaryRole: Joi.string().required(),
  secondaryRole: Joi.string(),
  notes: Joi.string()
})

async function createPlayer(player) {
  player = await Joi.validate(player, playerSchema, { abortEarly: false });

  return await new Player(player).save();
}

async function findPlayer(name, seasonId) {
  return Player.findOne({name: name, seasonId: seasonId});
}

async function updatePlayer(player, seasonId) {
  return await Player.updateOne({name: player.name, seasonId: seasonId}, player);
}

async function getAllPlayers(seasonId, noTeam) {
  const filters = {seasonId: seasonId};

  if (noTeam) {
    filters.teamId = null;
  }

  return await Player.find(filters);
}
