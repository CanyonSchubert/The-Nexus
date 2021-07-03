const ChampionAPI = require('../Models/ChampionModel');
const Discord = require('discord.js');
const { prefix } = require('../auth.json');
const fetch = require('node-fetch');

module.exports = {
	name: 'abilities',
	description: 'Gives details about all of a given champion\'s abilities, or a single one of them.',
	args: true,
	usage: prefix + 'abilities [champion name] **OR** ' + prefix + 'abilities [champion name] [p, q, w, e, OR r]',
	async execute(message, args) {
		const { client } = require('../bot.js');
		
		if (args[args.length-1].toLowerCase() == 'p' || args[args.length-1].toLowerCase() == 'q' || 
			args[args.length-1].toLowerCase() == 'w' || args[args.length-1].toLowerCase() == 'e' || 
			args[args.length-1].toLowerCase() == 'r') {
				var argAb = args.splice(args.length-1).toString().toLowerCase();	
		}
		
		args[0] = args[0].charAt(0).toUpperCase() + args[0].slice(1);
		
		if (args[0].includes('\'')) {
			var voidf = args[0].split('\'');
			voidf[1] = voidf[1].charAt(0).toUpperCase() + voidf[1].slice(1);
			args[0] = voidf.join('\'');
		} else if (args[0].includes('’')) {
			var voidf = args[0].split('’');
			voidf[1] = voidf[1].charAt(0).toUpperCase() + voidf[1].slice(1);
			args[0] = voidf.join('\'');
		}
		
		if (args[1] && args[1] != argAb) args[1] = args[1].charAt(0).toUpperCase() + args[1].slice(1);
		args = args.toString().replace(/,/g, ' ');
						
		var httpStr = 'https://ddragon.leagueoflegends.com/api/versions.json';
		const versions = await fetch(httpStr)
			.then(response => { return response.json() })
			.catch(err => { console.log('Error getting version information: ' + err) });
		
		httpStr = 'http://ddragon.leagueoflegends.com/cdn/' + versions[0] + '/data/en_US/champion.json';
		const champions = await fetch(httpStr)
			.then(response => { return response.json() })
			.catch(err => { console.log('Error getting all champion data: ' + err) });
			
		for (var x in champions.data) if (champions.data[x].name == args || champions.data[x].id == args) var champFound = champions.data[x].id;
		httpStr = 'http://ddragon.leagueoflegends.com/cdn/' + versions[0] + '/data/en_US/champion/' + champFound + '.json';
		var championData = await fetch(httpStr)
			.then(response => { return response.json(); })
			.catch(err => { console.log('Error getting specific champion data: ' + err);
				return message.reply('I can\'t find that champion.'); });
		
		var data = championData.data[champFound];
		
		const champion = ChampionAPI.setChampion(data.id, data.key, data.name, data.title, 
			data.image, data.tags, data.stats, data.spells, data.passive, versions[0]);
		console.log('Champion Pack filled successfully!');
		
		if (!argAb) {
			message.channel.send(new Discord.MessageEmbed()
				.setColor('#2e8fc2')
				.setTitle('Ability Textbook')
				.setThumbnail('http://ddragon.leagueoflegends.com/cdn/' + versions[0] + '/img/passive/' + champion.passive.image.full)
				.addField('**Passive**: ' + champion.passive.name, champion.passive.description.replace(/<br>/g, '\n').replace(/<[^>]+>/g, '*'))
			);
			message.channel.send(new Discord.MessageEmbed()
				.setColor('#2e8fc2')
				.setThumbnail('http://ddragon.leagueoflegends.com/cdn/' + versions[0] + '/img/spell/' + champion.spells[0].id + '.png')
				.addField('**Q**: ' + champion.spells[0].name, champion.spells[0].description.replace(/<br>/g, '\n').replace(/<[^>]+>/g, '*'))
			);
			message.channel.send(new Discord.MessageEmbed()
				.setColor('#2e8fc2')
				.setThumbnail('http://ddragon.leagueoflegends.com/cdn/' + versions[0] + '/img/spell/' + champion.spells[1].id + '.png')
				.addField('**W**: ' + champion.spells[1].name, champion.spells[1].description.replace(/<br>/g, '\n').replace(/<[^>]+>/g, '*'))
			);
			message.channel.send(new Discord.MessageEmbed()
				.setColor('#2e8fc2')
				.setThumbnail('http://ddragon.leagueoflegends.com/cdn/' + versions[0] + '/img/spell/' + champion.spells[2].id + '.png')
				.addField('**E**: ' + champion.spells[2].name, champion.spells[2].description.replace(/<br>/g, '\n').replace(/<[^>]+>/g, '*'))
			);
			message.channel.send(new Discord.MessageEmbed()
				.setColor('#2e8fc2')
				.setThumbnail('http://ddragon.leagueoflegends.com/cdn/' + versions[0] + '/img/spell/' + champion.spells[3].id + '.png')
				.addField('**R**: ' + champion.spells[3].name, champion.spells[3].description.replace(/<br>/g, '\n').replace(/<[^>]+>/g, '*'))

				.setTimestamp()
				.setFooter('Nexus.gg')
			);
		} else if (argAb == 'p') {
			message.channel.send(new Discord.MessageEmbed()
				.setColor('#2e8fc2')
				.setTitle('Ability Textbook')
				.setThumbnail('http://ddragon.leagueoflegends.com/cdn/' + versions[0] + '/img/passive/' + champion.passive.image.full)
				.addField('**Passive**: ' + champion.passive.name, champion.passive.description.replace(/<br>/g, '\n').replace(/<[^>]+>/g, '*'))
				.setTimestamp()
				.setFooter('Nexus.gg')
			);
		} else if (argAb == 'q' || argAb == 'w' || argAb == 'e' || argAb == 'r') {
			var numAb;
			switch (argAb) {
				case 'q': numAb = 0; break;
				case 'w': numAb = 1; break;
				case 'e': numAb = 2; break;
				case 'r': numAb = 3; break;
			}
			message.channel.send(new Discord.MessageEmbed()
				.setColor('#2e8fc2')
				.setTitle('Ability Textbook')
				.setThumbnail('http://ddragon.leagueoflegends.com/cdn/' + versions[0] + '/img/spell/' + champion.spells[numAb].id + '.png')
				.addField('**' + argAb.toUpperCase() + '**: ' + champion.spells[numAb].name, champion.spells[numAb].description.replace(/<br>/g, '\n').replace(/<[^>]+>/g, '*'))
				.setTimestamp()
				.setFooter('Nexus.gg')
			);
		}
	},
};