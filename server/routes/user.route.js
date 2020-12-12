const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const userCtrl = require('../controllers/user.controller');
const axios = require('axios')

const router = express.Router();
module.exports = router;

router.route('/').post(asyncHandler(insert));
router.get('/share-comp/:compCategoryId', getUsersToShareCompWith);
router.post('/share-comp/:compCategoryId', shareCompWithUser);
router.get('/:userId/team-comps', getCompCategoryForUser);
router.post('/:userId/team-comps', createCompCategory);
router.put('/:userId/team-comps/:compCategoryId', updateCompCategory);
router.get('/:userId/team-comps/:compCategoryId', getTeamCompsForUser);
router.post('/:userId/team-comps/comp/:compCategoryId', createComp);
router.put('/:userId/team-comps/comp/:compCategoryId/:compId', updateComp);
router.delete('/:userId/team-comps/comp/:compCategoryId/:compId', deleteTeamComp);

router.get('/latest-ddragon-version', getLatestDDragonVersion);
router.get('/champion-names', getChampionNames);

async function insert(req, res) {
  let user = await userCtrl.insert(req.body);
  res.json(user);
}

async function getUsersToShareCompWith(req, res) {
  let allUsers = await userCtrl.getAllUsers();
  let compCategoryId = req.params.compCategoryId;
  let userCompCategories = await userCtrl.getUserCompCategoriesByCategoryId(compCategoryId);

  userCompCategories = userCompCategories.map(userComp => userComp.toObject());
  allUsers = allUsers.map(user => user.toObject());

  if (userCompCategories) {
    allUsers = allUsers.filter(user => {
      return user && !userCompCategories.find(userComp => userComp.userId == user._id.toString());
    }).map(user => {
      return {
        id: user._id,
        name: user.fullname,
      };
    });
  }

  res.json(allUsers);
}

async function shareCompWithUser(req, res) {
  let userCompCategory = await userCtrl.createUserCompCategory(req.body);

  res.json(userCompCategory);
}

async function createCompCategory(req, res) {
  let userId = req.params.userId;
  let compCateogry = await userCtrl.createCompCategory(req.body);
  let userCompCategory = {
    userId,
    compCategoryId: compCateogry.toObject()._id.toString()
  };

  await userCtrl.createUserCompCategory(userCompCategory);

  res.json(compCateogry);
}

async function updateCompCategory(req, res) {
  let compCategoryId = req.params.compCategoryId;
  console.log(req.body);
  console.log(compCategoryId)
  let compCateogry = await userCtrl.updateCompCategory(req.body, compCategoryId);

  res.json(compCateogry);
}

async function createComp(req, res) {
  let comp = await userCtrl.createTeamComp(req.body);

  res.json(comp);
}

async function updateComp(req, res) {
  let compId = req.params.compId;
  let comp = await userCtrl.updateTeamComp(req.body, compId);

  res.json(comp);
}

async function deleteTeamComp(req, res) {
  let compId = req.params.compId;
  let comp = await userCtrl.deleteTeamComp(compId);

  res.json(comp);
}

async function getCompCategoryForUser(req, res) {
  let userId = req.params.userId;
  let userCompCategories = await userCtrl.getUserCompCategories(userId);
  let compCategories = [];

  if (userCompCategories) {
    userCompCategories = userCompCategories.map(category => category.toObject());

    compCategories = await Promise.all(userCompCategories.map(async category => await userCtrl.getCompCategory(category.compCategoryId)));
  }

  res.json({ compCategories });
}

async function getTeamCompsForUser(req, res) {
  let compCategoryId = req.params.compCategoryId;
  let userId = req.params.userId;
  let userCompCategory = await userCtrl.getUserCompCategoriesByCategoryIdAndUserId(compCategoryId, userId);
  let compCategory;
  
  if (userCompCategory) {
    compCategory = await userCtrl.getCompCategory(compCategoryId);
    let teamComps = await userCtrl.getTeamComps(compCategoryId);
  
    compCategory = compCategory.toObject();
    teamComps = teamComps.map(comp => comp.toObject());
  
    teamComps.forEach(comp => {
      if (comp) {
        const topChampionInfo = getChampionInfoByKey(comp.top);
        const jungleChampionInfo = getChampionInfoByKey(comp.jungle);
        const midChampionInfo = getChampionInfoByKey(comp.mid);
        const botChampionInfo = getChampionInfoByKey(comp.bot);
        const supportChampionInfo = getChampionInfoByKey(comp.support);
  
        comp.top = {
          name: comp.top,
          info: topChampionInfo ? topChampionInfo.info : null,
          tags: topChampionInfo ? topChampionInfo.tags : null,
        }
  
        comp.jungle = {
          name: comp.jungle,
          info: jungleChampionInfo ? jungleChampionInfo.info : null,
          tags: jungleChampionInfo ? jungleChampionInfo.tags : null,
        }
  
        comp.mid = {
          name: comp.mid,
          info: midChampionInfo ? midChampionInfo.info : null,
          tags: midChampionInfo ? midChampionInfo.tags : null,
        }
  
        comp.bot = {
          name: comp.bot,
          info: botChampionInfo ? botChampionInfo.info : null,
          tags: botChampionInfo ? botChampionInfo.tags : null,
        }
  
        comp.support = {
          name: comp.support,
          info: supportChampionInfo ? supportChampionInfo.info : null,
          tags: supportChampionInfo ? supportChampionInfo.tags : null,
        }
  
        comp.attack = comp.top.info.attack + comp.jungle.info.attack + comp.mid.info.attack + comp.bot.info.attack + comp.support.info.attack;
        comp.magic = comp.top.info.magic + comp.jungle.info.magic + comp.mid.info.magic + comp.bot.info.magic + comp.support.info.magic;
        comp.defense = comp.top.info.defense + comp.jungle.info.defense + comp.mid.info.defense + comp.bot.info.defense + comp.support.info.defense;
      }
    });
  
    compCategory.teamComps = teamComps;
  }

  res.json(compCategory);
}

let championJson = {};
let language = "en_US";
let cachedDDragonVersion;
let cachedDDragonVersionDate;

async function getLatestChampionDDragon() {
  if (championJson[language])
    return championJson[language];

    const version = await getDDragonVersion();
    const response = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${version}/data/${language}/champion.json`);

    const json = response.data;
    championJson[language] = json
}

function getChampionInfoByKey(name) {
  if (championJson[language] && championJson[language].data && championJson[language].data[name]) {
   return championJson[language].data[name];
  }
}

async function getLatestDDragonVersion(req, res) {
  const version = await getDDragonVersion();

   res.json({ version })
}

async function getDDragonVersion() {
  const today = new Date();

  if (!cachedDDragonVersion || today > cachedDDragonVersionDate) {
    cachedDDragonVersion = (await axios.get("http://ddragon.leagueoflegends.com/api/versions.json")).data[0];
    cachedDDragonVersionDate = new Date();
    cachedDDragonVersionDate.setDate(cachedDDragonVersionDate.getDate() + 14);
  }

  return cachedDDragonVersion;
}

async function getChampionNames(req, res) {
  let championNames = [];

  if (championJson[language] && championJson[language].data && championJson[language]) {
    championNames = Object.keys(championJson[language].data);
  }

   res.json({ championNames })
}

async function getChampionData() {
  await getLatestChampionDDragon();
}

getChampionData();