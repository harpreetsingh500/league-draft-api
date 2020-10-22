const jwt = require('jsonwebtoken');
const config = require('../config/config');
const mongoose = require('mongoose');
const Season = require('../models/season.model');
const Team = require('../models/team.model');
const Joi = require('joi');

module.exports = {
  getAllSeasons,
  getSeason,
  createSeason,
  createTeam,
  updateTeam,
  getTeams
}

const seasonSchema = Joi.object({
  name: Joi.string().required()
})

const teamSchema = Joi.object({
  name: Joi.string().required(),
  seasonId: Joi.string().required(),
  captain: Joi.string().required(),
  players: Joi.array(),
  img: Joi.string().required()
})

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

async function getSeason(id) {
  return await Season.findById(id);
}

async function getTeams(seasonId) {
  return await Team.find({seasonId: seasonId});
}

async function getAllSeasons() {
  return await Season.find();
}
