const Season = require('../models/season.model');
const Team = require('../models/team.model');
const Match = require('../models/match.model');
const GameResult = require('../models/game-result.model');
const Joi = require('joi');

module.exports = {
  getAllSeasons,
  getSeason,
  createSeason,
  createTeam,
  updateTeam,
  getTeams,
  saveGameResult,
  createMatch,
  updateMatch,
  deleteMatch,
  getAllMatches
}

const seasonSchema = Joi.object({
  name: Joi.string().required()
});

const teamSchema = Joi.object({
  name: Joi.string().required(),
  seasonId: Joi.string().required(),
  captain: Joi.string().required(),
  players: Joi.array(),
  img: Joi.string().required()
});

const matchSchema = Joi.object({
  seasonId: Joi.string().required(),
  teamOneId: Joi.string().required(),
  teamTwoId: Joi.string().required(),
  teamOneProtectedBan: Joi.string().required(),
  teamTwoProtectedBan: Joi.string().required(),
  matchDate: Joi.string().required(),
  matchTime: Joi.string().required(),
  timeZone: Joi.string().required(),
  matchLink: Joi.empty(),
  winningTeamId: Joi.empty()
});

async function createSeason(season) {
  season = await Joi.validate(season, seasonSchema, { abortEarly: false });

  return await new Season(season).save();
}

async function createTeam(team) {
  team = await Joi.validate(team, teamSchema, { abortEarly: false });

  return await new Team(team).save();
}

async function updateTeam(team) {
  return await Team.updateOne({_id: team._id}, team);
}

async function createMatch(match) {
  match = await Joi.validate(match, matchSchema, { abortEarly: false });

  return await new Match(match).save();
}

async function updateMatch(match, seasonId) {
  match = await Joi.validate(match, matchSchema, { abortEarly: false });

  return Match.updateOne({_id: seasonId}, match);
}

async function deleteMatch(match, seasonId) {
  return Match.deleteOne({_id: seasonId}, match);
}

async function getAllMatches(seasonId) {
  return await Match.find({seasonId: seasonId});
}

async function getSeason(id) {
  return await Season.findById(id);
}

async function getTeams(seasonId) {
  return await Team.find({seasonId: seasonId});
}

async function getAllSeasons() {
  return await Season.find();
}

async function saveGameResult(game) {
  return await new GameResult(game).save();
}
