const express = require('express');

const router = express.Router();
const axios = require('axios')

module.exports = router;

function isHEHeroPriceLow(heroes, heroName, heroPrice, heroRarity) {
  if (heroes && heroes.length && heroName && heroPrice) {
    const allHeroPrices = heroes.filter(hero => hero.name === heroName && hero.sale && hero.rarity === heroRarity)
          .map(hero => hero.sale.price)
    const firstFive =  allHeroPrices
          .slice(0, 5)
          .sort();
    const priceAverage = firstFive.reduce((a, b) => a + b) / firstFive.length;

    return heroPrice <= priceAverage;
  }
}

function getHEHeroRarityColor(rarity) {
  if (rarity) {
    switch (rarity.toLowerCase()) {
      case "rare":
      case "rare+":
        return 2520552;
      case "epic":
      case "epic+":
        return 11997656;
      case "legendary":
      case "legendary+":
        return 14646284;
      case "immortal":
      case "immortal+":
        return 15206404;
      case "ultimate":
        return 14536974; 
      default:
        return 0;
    }
  }
}

async function getHEListings() {
  const hePriceUSD = await getHEPriceInUSD();
  const allHeroes = [];
  let championArray = [];
  let currentTime = new Date(new Date() - 600000);

  allHeroes.push(...await getHEHeroes('Rare+'));
  allHeroes.push(...await getHEHeroes('Epic'));
  allHeroes.push(...await getHEHeroes('Epic+'));
  allHeroes.push(...await getHEHeroes('Legendary'));
  allHeroes.push(...await getHEHeroes('Legendary+'));
  allHeroes.push(...await getHEHeroes('Immortal'));
  allHeroes.push(...await getHEHeroes('Immortal+'));
  allHeroes.push(...await getHEHeroes('Ultimate'));

  allHeroes.forEach((champ) => {
    if(champ.sale) {
      let saleStartTime = new Date(champ.sale.startTime);
      if(saleStartTime > currentTime) {
          championArray.push({
              champName: champ.name,
              champPrice: champ.sale.price,
              champId: champ.id,
              champAddress: `https://meta.heroesempires.com/en/stats/${champ.tokenId}`,
              champRarity: '',
              champBuy: `https://market.heroesempires.com/market/${champ.id}`
          })
      };
    }
  });

  const embed = {
    username: 'HE Price Bot',
    "embeds": []
  };

  for(let newChampNum = 0;newChampNum < championArray.length;newChampNum++) {
    let res = await axios.get(championArray[newChampNum].champAddress);
    let curChamp = res.data;
    let hePrice = championArray[newChampNum].champPrice;
    let heroPriceUSD = (hePrice * hePriceUSD).toFixed(2);

    championArray[newChampNum].champRarity = curChamp.Tier;

    embed.embeds.push({
      "author": {
        "name": `${championArray[newChampNum].champRarity.toUpperCase()} | ${championArray[newChampNum].champName} | ${hePrice} HE ($${heroPriceUSD})`,
        "url": championArray[newChampNum].champBuy,
        "icon_url": heHeroes[championArray[newChampNum].champName]
      },
      "color": getHEHeroRarityColor(championArray[newChampNum].champRarity),
      "description": `[View Details](${championArray[newChampNum].champBuy})`
    })
  };

  championArray = championArray.filter(champ => isHEHeroPriceLow(allHeroes, champ.champName, champ.champPrice, champ.champRarity));

  for(let champRange = 0;champRange < championArray.length;champRange+=5) {
  setTimeout(() => {
      const data = JSON.stringify({username: 'HE Price Bot', embeds: embed.embeds.slice(champRange, champRange+5)});

      axios.post('https://discord.com/api/webhooks/912556901408067654/n_Cw7aNE9yy4s5UbZfehuAGxqhM5YiSEmV8Gj7bqBlity7RZ3fUKCSIMd-a4vasM6ngV', data, {
        headers: {
            'Content-Type': 'application/json',
        }
    })
      .then((res) => {
          // console.log(`Status: ${res.status}`);
          // console.log('Body: ', res.data);
      }).catch((err) => {
          // console.error(err);
      });

      axios.post('https://discord.com/api/webhooks/913611725897625620/XwYWvsQTCnPCDr7J8raNGJtvXl0ke0YFybdDFHjABdX2E4qsUelmrnI4OBK8N51KK9B4', data, {
        headers: {
            'Content-Type': 'application/json',
        }
    })
      .then((res) => {
          // console.log(`Status: ${res.status}`);
          // console.log('Body: ', res.data);
      }).catch((err) => {
          // console.error(err);
      });
  }, champRange*500);
  }
}

const intervalMinutes = 10;
const heHeroes = {
  "Akyla": "https://support.heroesempires.com/hc/article_attachments/4408306747033/mceclip1.png",
  "Ares": "https://support.heroesempires.com/hc/article_attachments/4408314658457/mceclip5.png",
  "Atharina": "https://support.heroesempires.com/hc/article_attachments/4408314681625/mceclip8.png",
  "Balerion": "https://support.heroesempires.com/hc/article_attachments/4408314702105/mceclip11.png",
  "Bertha": "https://support.heroesempires.com/hc/article_attachments/4408315088665/mceclip14.png",
  "Bomber": "https://support.heroesempires.com/hc/article_attachments/4408315312665/mceclip17.png",
  "Chiron": "https://support.heroesempires.com/hc/article_attachments/4408307511833/mceclip20.png",
  "ClockCrank": "https://support.heroesempires.com/hc/article_attachments/4408315408409/mceclip25.png",
  "Diggy": "https://support.heroesempires.com/hc/article_attachments/4408307515929/mceclip26.png",
  "Dinger": "https://support.heroesempires.com/hc/article_attachments/4408307518233/mceclip29.png",
  "Durin": "https://support.heroesempires.com/hc/article_attachments/4408307521561/mceclip32.png",
  "Dusk": "https://support.heroesempires.com/hc/article_attachments/4408315417881/mceclip37.png",
  "Elisa": "https://support.heroesempires.com/hc/article_attachments/4408307526297/mceclip38.png",
  "Faegon": "https://support.heroesempires.com/hc/article_attachments/4408307528857/mceclip41.png",
  "Farah": "https://support.heroesempires.com/hc/article_attachments/4408307600537/mceclip44.png",
  "Fellow": "https://support.heroesempires.com/hc/article_attachments/4408307604249/mceclip47.png",
  "Finn": "https://support.heroesempires.com/hc/article_attachments/4408315544473/mceclip50.png",
  "Golemus": "https://support.heroesempires.com/hc/article_attachments/4408315549209/mceclip53.png",
  "Gumiho": "https://support.heroesempires.com/hc/article_attachments/4408315552921/mceclip56.png",
  "Hades": "https://support.heroesempires.com/hc/article_attachments/4408315556889/mceclip59.png",
  "Haze": "https://support.heroesempires.com/hc/article_attachments/4408341460761/mceclip0.png",
  "Jeatah": "https://support.heroesempires.com/hc/article_attachments/4408341488281/mceclip5.png",
  "Jubaba": "https://support.heroesempires.com/hc/article_attachments/4408341495577/mceclip6.png",
  "Kaiser": "https://support.heroesempires.com/hc/article_attachments/4408341503641/mceclip9.png",
  "Keepy": "https://support.heroesempires.com/hc/article_attachments/4408341538841/mceclip12.png",
  "Kha": "https://support.heroesempires.com/hc/article_attachments/4408348282905/mceclip15.png",
  "Leoric": "https://support.heroesempires.com/hc/article_attachments/4408341570329/mceclip18.png",
  "Liona": "https://support.heroesempires.com/hc/article_attachments/4408348330521/mceclip21.png",
  "Lionidas": "https://support.heroesempires.com/hc/article_attachments/4408341606553/mceclip24.png",
  "Lorki": "https://support.heroesempires.com/hc/article_attachments/4408348349081/mceclip27.png",
  "Lynn": "https://support.heroesempires.com/hc/article_attachments/4408341692569/mceclip30.png",
  "Medusa": "https://support.heroesempires.com/hc/article_attachments/4408341727513/mceclip36.png",
  "Midu": "https://support.heroesempires.com/hc/article_attachments/4408348704921/mceclip0.png",
  "MrsHazard": "https://support.heroesempires.com/hc/article_attachments/4408342035097/mceclip3.png",
  "Nama": "https://support.heroesempires.com/hc/article_attachments/4408342137113/mceclip4.png",
  "Nekrosius": "https://support.heroesempires.com/hc/article_attachments/4408342147993/mceclip7.png",
  "Neptune": "https://support.heroesempires.com/hc/article_attachments/4408349029017/mceclip10.png",
  "Odin": "https://support.heroesempires.com/hc/article_attachments/4408349038617/mceclip13.png",
  "Pharmacist": "https://support.heroesempires.com/hc/article_attachments/4408342393497/mceclip16.png",
  "Pigrider": "https://support.heroesempires.com/hc/article_attachments/4408349065881/mceclip19.png",
  "QQtrox": "https://support.heroesempires.com/hc/article_attachments/4408342414361/mceclip22.png",
  "Rafiki": "https://support.heroesempires.com/hc/article_attachments/4408342423193/mceclip25.png",
  "Ragnuk": "https://support.heroesempires.com/hc/article_attachments/4408342502425/mceclip29.png",
  "Ruvina": "https://support.heroesempires.com/hc/article_attachments/4408349163545/mceclip32.png",
  "Seth": "https://support.heroesempires.com/hc/article_attachments/4408342514841/mceclip35.png",
  "Sonata": "https://support.heroesempires.com/hc/article_attachments/4408342521881/mceclip38.png",
  "Spectune": "https://support.heroesempires.com/hc/article_attachments/4408349183897/mceclip41.png",
  "Succubus": "https://support.heroesempires.com/hc/article_attachments/4408342553497/mceclip44.png",
  "Swift": "https://support.heroesempires.com/hc/article_attachments/4408342566169/mceclip47.png",
  "Syllabear": "https://support.heroesempires.com/hc/article_attachments/4408350517785/mceclip51.png",
  "Tidus": "https://support.heroesempires.com/hc/article_attachments/4408343870105/mceclip52.png",
  "Timble": "https://support.heroesempires.com/hc/article_attachments/4408350547225/mceclip55.png",
  "Tolan": "https://firebasestorage.googleapis.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-MhRIVN9mkaErwYTfzUX%2Fuploads%2FRg8Z130iCb1WmHrLQZym%2Ffile.png?alt=media",
  "Tomee": "https://support.heroesempires.com/hc/article_attachments/4408343893017/mceclip58.png",
  "Tranqui": "https://support.heroesempires.com/hc/article_attachments/4408350563993/mceclip61.png",
  "Tusk": "https://support.heroesempires.com/hc/article_attachments/4408350572057/mceclip64.png",
  "Victor": "https://support.heroesempires.com/hc/article_attachments/4408350576409/mceclip67.png",
  "Vy": "https://support.heroesempires.com/hc/article_attachments/4408343937049/mceclip70.png",
  "Wukong": "https://support.heroesempires.com/hc/article_attachments/4408343941529/mceclip73.png",
  "Zak": "https://support.heroesempires.com/hc/article_attachments/4408350611993/mceclip75.png",
  "Ballista": "https://firebasestorage.googleapis.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-MhRIVN9mkaErwYTfzUX%2Fuploads%2Fh1mTInBLcpr5sewJFwEZ%2Ffile.png?alt=media",
  "CasterMinion": "https://firebasestorage.googleapis.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-MhRIVN9mkaErwYTfzUX%2Fuploads%2FGXgkLlIcBvQ4guw7PdjJ%2Ffile.png?alt=media",
  "Catapult": "https://firebasestorage.googleapis.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-MhRIVN9mkaErwYTfzUX%2Fuploads%2FwwLRVYqYioSvvPJ5veiT%2Ffile.png?alt=media",
  "ChikenBomer": "https://firebasestorage.googleapis.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-MhRIVN9mkaErwYTfzUX%2Fuploads%2FXQTw6dDieoexhBMrktTz%2Ffile.png?alt=media",
  "EarthDragon": "https://firebasestorage.googleapis.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-MhRIVN9mkaErwYTfzUX%2Fuploads%2FgFqEq7o1u7reRB2ELA6S%2Ffile.png?alt=media",
  "FairyDragon": "https://firebasestorage.googleapis.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-MhRIVN9mkaErwYTfzUX%2Fuploads%2FGXgkLlIcBvQ4guw7PdjJ%2Ffile.png?alt=media",
  "FriendlyGolem": "https://firebasestorage.googleapis.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-MhRIVN9mkaErwYTfzUX%2Fuploads%2FS65I7ATdOsgkfytRsRvD%2Ffile.png?alt=media",
  "KnightMinion": "https://firebasestorage.googleapis.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-MhRIVN9mkaErwYTfzUX%2Fuploads%2FwcHIFsO88Tbe6LVVSlRr%2Ffile.png?alt=media",
  "MutantRabbit": "https://firebasestorage.googleapis.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-MhRIVN9mkaErwYTfzUX%2Fuploads%2FsaBYh5CCgdLsAlT49eYV%2Ffile.png?alt=media",
  "TraineeSniper": "https://firebasestorage.googleapis.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-MhRIVN9mkaErwYTfzUX%2Fuploads%2FLJpMMJlgBnJMvmUll9ll%2Ffile.png?alt=media",
  "WarriorMinion": "https://firebasestorage.googleapis.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-MhRIVN9mkaErwYTfzUX%2Fuploads%2F3Ovoo0DCYzmMYFqGJTYz%2Ffile.png?alt=media",
  "Wolf": "https://firebasestorage.googleapis.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-MhRIVN9mkaErwYTfzUX%2Fuploads%2FrObomoUYmGOLIEV1xkhL%2Ffile.png?alt=media",
  "WyvernDragon": "https://firebasestorage.googleapis.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F-MhRIVN9mkaErwYTfzUX%2Fuploads%2FaQB2wbQeb1pcW6N31N9w%2Ffile.png?alt=media"
};

async function getHEPriceInUSD() {
  const response = await axios.get('https://api.coingecko.com/api/v3/coins/heroes-empires');

  if (response) {
    return response.data['market_data']['current_price']['usd'];
  }
}

async function getHEHeroes(rarity) {
  const encodedRartiy = rarity.replace(/[+]/, '%2B');

  const response = await axios.get(`https://marketplace-api.heroesempires.com/sale-items?class&desc=false&listedOnMarket=true&maxPrice&minPrice&orderBy=price&page=1&race&search=&size=3000&tier=${encodedRartiy}`);

  if (response && response.data && response.data.data && response.data.data.items) {
    response.data.data.items.forEach(item => item.rarity = rarity);
  }

  return response.data.data.items;
}

getHEListings();

setInterval(function(){ 
  getHEListings();
}, 1000 * 60 * intervalMinutes);
