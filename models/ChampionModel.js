/**
 * This file is for common champion operations and functions to be exported
 * 
 * uses tutorial at https://stackoverflow.com/questions/44980247/how-to-finish-all-fetch-before-executing-next-function-in-react
 */
var fetch = require('node-fetch');
var ddragonAPIStr;

exports.getRandomChampion = async function(id) {
	
	console.log('./ChampionModel.js getRandomChampion function entered!');
	
	var raw = await this.getAllRawVersionsAndChampionsData();

	var rand = Math.ceil(Math.random() * Object.keys(raw.champions.data).length);
    var championId = Object.keys(raw.champions.data)[rand];

    var champion = await this.getAllRawChampionData(raw.version, championId);

	var data = champion.data[championId];
	//console.log(data);

	const resultChampion = this.setChampion(data.id, data.key, data.name, data.title, 
		data.image, data.tags, data.stats, data.spells, data.passive, raw.version);
	console.log('Champion Pack filled successfully!');

	console.log('Returning from getRandomChampion function in ./ChampionModel.js!');
	
	return resultChampion;
}

exports.getChampionByKey = async function(key) {

    console.log('./champion.js getChampionByKey function entered!');
	
	var raw = await this.getAllRawVersionsAndChampionsData();

	for (var x in raw.champions.data) 
        if (raw.champions.data[x].key == key) 
            var championId = raw.champions.data[x].id;

	var champion = await this.getAllRawChampionData(raw.version, championId);
			
	var data = champion.data[championId];
	//console.log(data);

	const resultChampion = this.setChampion(data.id, data.key, data.name, data.title, 
		data.image, data.tags, data.stats, data.spells, data.passive, raw.versions);
	console.log('Champion Pack filled successfully!');

	console.log('Returning from getChampionByKey function in ./champion.js!');
	
	return resultChampion;
}

exports.getChampionByName = async function(name) {

}

exports.setChampion = function(id, key, name, title, image, tags, stats, spells, passive, version) {
    
    console.log('./ChampionModel.js setChampion function entered!');
	
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
	
	console.log('Return from setChampion function in ./ChampionModel.js');
	
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
        champions: champions
    }

    return raw;
}

exports.getAllRawChampionData = async function(version, id) {

    ddragonAPIStr = 'http://ddragon.leagueoflegends.com/cdn/' + version + '/data/en_US/champion/' + id + '.json';
	var champion = await fetch(ddragonAPIStr)
		.then(response => { return response.json() })
		.catch(error => { console.log('Error getting random champion data: ' + err) });

    return champion;
}