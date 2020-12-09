const bcrypt = require('bcrypt');
const Joi = require('joi');
const User = require('../models/user.model');
const CompCategory = require('../models/comp-category');
const UserCompCategory = require('../models/user-comp-category');
const TeamComp = require('../models/team-comp');

const userSchema = Joi.object({
  fullname: Joi.string().required(),
  email: Joi.string().email(),
  mobileNumber: Joi.string().regex(/^[1-9][0-9]{9}$/),
  password: Joi.string().required(),
  repeatPassword: Joi.string().required().valid(Joi.ref('password'))
});

const compCategorySchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.empty(),
  creatorId: Joi.string().required(),
});

const compUserCategorySchema = Joi.object({
  userId: Joi.string().required(),
  compCategoryId: Joi.string().required(),
});

const teamCompSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.empty(),
  top: Joi.string().required(),
  jungle: Joi.string().required(),
  mid: Joi.string().required(),
  bot: Joi.string().required(),
  support: Joi.string().required(),
  type: Joi.string().required(),
  creatorId: Joi.string().required(),
  compCategoryId: Joi.string().required(),
});

module.exports = {
  insert,
  getAllUsers,
  createCompCategory,
  updateCompCategory,
  createUserCompCategory,
  getUserCompCategories,
  getCompCategory,
  createTeamComp,
  getTeamComps,
  updateTeamComp,
  deleteTeamComp,
  getUserCompCategoriesByCategoryId,
  getUserCompCategoriesByCategoryIdAndUserId
}

async function insert(user) {
  user = await Joi.validate(user, userSchema, { abortEarly: false });
  user.hashedPassword = bcrypt.hashSync(user.password, 10);
  delete user.password;
  return await new User(user).save();
}

async function getAllUsers() {
  return await User.find();
}

async function getCompCategory(compCategoryId) {
  return await CompCategory.findById(compCategoryId);
}

async function createCompCategory(compCateogry) {
  compCateogry = await Joi.validate(compCateogry, compCategorySchema, { abortEarly: false });

  return await CompCategory(compCateogry).save();
}

async function updateCompCategory(compCateogry, compCateogryId) {
  compCateogry = await Joi.validate(compCateogry, compCategorySchema, { abortEarly: false });

  return CompCategory.updateOne({_id: compCateogryId}, compCateogry);
}

async function getUserCompCategories(userId) {
  return await UserCompCategory.find({userId: userId});
}

async function getUserCompCategoriesByCategoryId(compCategoryId) {
  return await UserCompCategory.find({compCategoryId: compCategoryId});
}

async function getUserCompCategoriesByCategoryIdAndUserId(compCategoryId, userId) {
  return await UserCompCategory.findOne({compCategoryId: compCategoryId, userId: userId});
}

async function createUserCompCategory(compUserCategory) {
  compUserCategory = await Joi.validate(compUserCategory, compUserCategorySchema, { abortEarly: false });

  return await new UserCompCategory(compUserCategory).save();
}

async function getTeamComps(compCategoryId) {
  return await TeamComp.find({compCategoryId: compCategoryId});
}

async function createTeamComp(comp) {
  comp = await Joi.validate(comp, teamCompSchema, { abortEarly: false });

  return await new TeamComp(comp).save();
}
  
async function updateTeamComp(comp, compId) {
  comp = await Joi.validate(comp, teamCompSchema, { abortEarly: false });

  return TeamComp.updateOne({_id: compId}, comp);
}

async function deleteTeamComp(compId) {
  return TeamComp.deleteOne({_id: compId});
}