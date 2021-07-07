/**
 * This file is for common champion operations and functions to be exported
 * 
 * uses tutorial at https://stackoverflow.com/questions/44980247/how-to-finish-all-fetch-before-executing-next-function-in-react
 */
const fetch = require('node-fetch');
const { devMode } = require('../appConfig.json');
var ddragonAPIStr;

exports.getRandomChampion = async function(id) {
	
	if (devMode.isOn) console.log('./ChampionModel.js getRandomChampion function entered!');
	
	var raw = await this.getAllRawVersionsAndChampionsData();

	var rand = Math.ceil(Math.random() * Object.keys(raw.champions.data).length);
    var championId = Object.keys(raw.champions.data)[rand];

    var champion = await this.getAllRawChampionData(raw.version, championId);

	var data = champion.data[championId];
	//console.log(data);

	const resultChampion = this.setChampion(data.id, data.key, data.name, data.title, 
		data.image, data.tags, data.stats, data.spells, data.passive, raw.version);
	if (devMode.isOn) console.log('Champion Pack filled successfully!');

	if (devMode.isOn) console.log('Returning from getRandomChampion function in ./ChampionModel.js!');
	
	return resultChampion;
}

exports.getChampionByKey = async function(key) {

    if (devMode.isOn) console.log('./ChampionModel.js getChampionByKey function entered!');
	
	var raw = await this.getAllRawVersionsAndChampionsData();

	for (var x in raw.champions.data) 
        if (raw.champions.data[x].key == key) 
            var championId = raw.champions.data[x].id;

	var champion = await this.getAllRawChampionData(raw.version, championId);
			
	var data = champion.data[championId];
	//console.log(data);

	const resultChampion = this.setChampion(data.id, data.key, data.name, data.title, 
		data.image, data.tags, data.stats, data.spells, data.passive, raw.versions);
	if (devMode.isOn) console.log('Champion Pack filled successfully!');

	if (devMode.isOn) console.log('Returning from getChampionByKey function in ./ChampionModel.js!');
	
	return resultChampion;
}

exports.getChampionByName = async function(name) {

	if (devMode.isOn) console.log('./ChampionModel.js getChampionByName function entered!');
	
	var raw = await this.getAllRawVersionsAndChampionsData();

	var championId = "Not Found";
	for (var x in raw.champions.data) 
        if (raw.champions.data[x].name.toLowerCase() == name.toLowerCase()) {
            championId = raw.champions.data[x].id;
			break;
		}
		else if (raw.champions.data[x].id.toLowerCase() == name.toLowerCase()) {
			championId = raw.champions.data[x].id;
			break;
		}
		else if (raw.champions.data[x].name.toLowerCase().includes(name.toLowerCase())) {
			championId = raw.champions.data[x].id;
		}
		else if (raw.champions.data[x].id.toLowerCase().includes(name.toLowerCase())) {
			championId = raw.champions.data[x].id;	
		}
		else {
			for (var i = 0; i < this.specialCases().length; ++i) {
				if (this.specialCases()[i].case.toLowerCase() == name.toLowerCase()) {
					championId = this.specialCases()[i].id;
					break;
				}
			}
		}

	var champion = await this.getAllRawChampionData(raw.version, championId);
	if (champion == undefined)
		return "Champion not found.";
			
	var data = champion.data[championId];
	//console.log(data);

	const resultChampion = this.setChampion(data.id, data.key, data.name, data.title, 
		data.image, data.tags, data.stats, data.spells, data.passive, raw.versions);
	if (devMode.isOn) console.log('Champion Pack filled successfully!');

	if (devMode.isOn) console.log('Returning from getChampionByName function in ./ChampionModel.js!');
	
	return resultChampion;
}

exports.setChampion = function(id, key, name, title, image, tags, stats, spells, passive, version) {
    
    if (devMode.isOn) console.log('./ChampionModel.js setChampion function entered!');
	
	var championData = {
		id : id,
		key : key,
		name : name,
		title : title,
		image : image,
		tags : tags,
		stats : stats,
		spells : spells,
		passive : passive,
		version : version
	};
	
	if (devMode.isOn) console.log('Return from setChampion function in ./ChampionModel.js');
	
	return championData;
}

exports.getAllRawVersionsAndChampionsData = async function() {

    ddragonAPIStr = 'https://ddragon.leagueoflegends.com/api/versions.json';
	const versions = await fetch(ddragonAPIStr)
		.then(response => { return response.json() })
		.catch(err => { console.log('Error getting version information: ' + err) });
		
	ddragonAPIStr = 'http://ddragon.leagueoflegends.com/cdn/' + versions[0] + '/data/en_US/champion.json';
	const champions = await fetch(ddragonAPIStr)
		.then(response => { return response.json() })
		.catch(err => { console.log('Error getting all champion data: ' + err) });

    var raw = {
        version : versions[0],
        champions : champions
    }

    return raw;
}

exports.getAllRawChampionData = async function(version, id) {

    ddragonAPIStr = 'http://ddragon.leagueoflegends.com/cdn/' + version + '/data/en_US/champion/' + id + '.json';
	var champion = await fetch(ddragonAPIStr)
		.then(response => { return response.json() })
		.catch(err => { console.log('Error getting champion data: ' + err); });

    return champion;
}

exports.specialCases = function() {
	var specialCases = [
		{ case : "cow", id : "Alistar" },
		{ case : "mummy", id : "Amumu" },
		{ case : "moon boi", id : "Aphelios" },
		{ case : "asol", id : "AurelionSol" },
		{ case : "gp", id : "Gangplank" },
		{ case : "j4", id : "JarvanIV" },
		{ case : "4", id : "Jhin" },
		{ case : "powder", id : "Jinx" },
		{ case : "rhaast", id : "Kayn" },
		{ case : "k6", id : "Khazix" },
		{ case : "lamb", id : "Kindred" },
		{ case : "wolf", id : "Kindred" },
		{ case : "lb", id : "Leblanc" },
		{ case : "bambi", id : "Lillia" },
		{ case : "luxanna", id : "Lux" },
		{ case : "mf", id : "MissFortune" },
		{ case : "susan", id : "Nasus" },
		{ case : "atreus", id : "Pantheon" },
		{ case : "poopy", id : "Poppy" },
		{ case : "qiqi", id : "Qiyana" },
		{ case : "valor", id : "Quinn" },
		{ case : "ok", id : "Rammus" },
		{ case : "okay", id : "Rammus" },
		{ case : "knife cat", id : "Rengar" },
		{ case : "bristle", id : "Sejuani" },
		{ case : "dio", id : "Sett" },
		{ case : "sriracha", id : "Soraka" },
		{ case : "jericho", id : "Swain" },
		{ case : "tk", id : "TahmKench" },
		{ case : "thomas kenchington", id : "TahmKench" },
		{ case : "teeto", id : "Teemo" },
		{ case : "satan", id : "Teemo" },
		{ case : "tito", id : "Teemo" },
		{ case : "troll", id : "Trundle" },
		{ case : "tf", id : "TwistedFate" },
		{ case : "rat", id : "Twitch" },
		{ case : "godyr", id : "Udyr" },
		{ case : "kai and valmar", id : "Varus" },
		{ case : "the ruined king", id : "Viego" },
		{ case : "ww", id : "Warwick" },
		{ case : "monkey", id : "MonkeyKing" },
		{ case : "cat", id : "Yuumi" }
	]

	return specialCases;
}