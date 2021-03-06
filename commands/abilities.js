const ChampionAPI = require('../models/ChampionModel');
const Discord = require('discord.js');
const { prefix } = require('../appConfig.json');

module.exports = {
	name: 'abilities',
	description: 'Gives details about all of a given champion\'s abilities, or a single one of them.',
	args: true,
	usage: 'abilities [champion name] **OR** ' + prefix + 'abilities [champion name] [p, q, w, e, OR r]',
	async execute(message, args) {
		
		if (args[args.length-1].toLowerCase() == 'p' || args[args.length-1].toLowerCase() == 'q' || 
			args[args.length-1].toLowerCase() == 'w' || args[args.length-1].toLowerCase() == 'e' || 
			args[args.length-1].toLowerCase() == 'r') {
				var abilityArg = args.pop().toString().toLowerCase();	
		}
						
		var raw = await ChampionAPI.getAllRawVersionsAndChampionsData();

		var champion = await ChampionAPI.getChampionByName(args);
		if (champion == "Champion not found.") {
			message.channel.send("I can\'t find that champion, please try again.");
			return;
		}
		
		if (!abilityArg) {
			message.channel.send(new Discord.MessageEmbed()
				.setColor('#2e8fc2')
				.setTitle('Ability Textbook')
				.setThumbnail('http://ddragon.leagueoflegends.com/cdn/' + raw.version + '/img/passive/' + champion.passive.image.full)
				.addField('**Passive**: ' + champion.passive.name, champion.passive.description.replace(/<br>/g, '\n').replace(/<[^>]+>/g, '*'))
			);
			message.channel.send(new Discord.MessageEmbed()
				.setColor('#2e8fc2')
				.setThumbnail('http://ddragon.leagueoflegends.com/cdn/' + raw.version + '/img/spell/' + champion.spells[0].id + '.png')
				.addField('**Q**: ' + champion.spells[0].name, champion.spells[0].description.replace(/<br>/g, '\n').replace(/<[^>]+>/g, '*'))
			);
			message.channel.send(new Discord.MessageEmbed()
				.setColor('#2e8fc2')
				.setThumbnail('http://ddragon.leagueoflegends.com/cdn/' + raw.version + '/img/spell/' + champion.spells[1].id + '.png')
				.addField('**W**: ' + champion.spells[1].name, champion.spells[1].description.replace(/<br>/g, '\n').replace(/<[^>]+>/g, '*'))
			);
			message.channel.send(new Discord.MessageEmbed()
				.setColor('#2e8fc2')
				.setThumbnail('http://ddragon.leagueoflegends.com/cdn/' + raw.version + '/img/spell/' + champion.spells[2].id + '.png')
				.addField('**E**: ' + champion.spells[2].name, champion.spells[2].description.replace(/<br>/g, '\n').replace(/<[^>]+>/g, '*'))
			);
			message.channel.send(new Discord.MessageEmbed()
				.setColor('#2e8fc2')
				.setThumbnail('http://ddragon.leagueoflegends.com/cdn/' + raw.version + '/img/spell/' + champion.spells[3].id + '.png')
				.addField('**R**: ' + champion.spells[3].name, champion.spells[3].description.replace(/<br>/g, '\n').replace(/<[^>]+>/g, '*'))

				.setTimestamp()
				.setFooter('Nexus.gg')
			);
		} else if (abilityArg.toLowerCase() == 'p') {
			message.channel.send(new Discord.MessageEmbed()
				.setColor('#2e8fc2')
				.setTitle('Ability Textbook')
				.setThumbnail('http://ddragon.leagueoflegends.com/cdn/' + raw.version + '/img/passive/' + champion.passive.image.full)
				.addField('**Passive**: ' + champion.passive.name, champion.passive.description.replace(/<br>/g, '\n').replace(/<[^>]+>/g, '*'))
				.setTimestamp()
				.setFooter('Nexus.gg')
			);
		} else if (abilityArg.toLowerCase() == 'q' || abilityArg.toLowerCase() == 'w' || abilityArg.toLowerCase() == 'e' || abilityArg.toLowerCase() == 'r') {
			var numAb;
			switch (abilityArg.toLowerCase()) {
				case 'q': numAb = 0; break;
				case 'w': numAb = 1; break;
				case 'e': numAb = 2; break;
				case 'r': numAb = 3; break;
			}
			message.channel.send(new Discord.MessageEmbed()
				.setColor('#2e8fc2')
				.setTitle('Ability Textbook')
				.setThumbnail('http://ddragon.leagueoflegends.com/cdn/' + raw.version + '/img/spell/' + champion.spells[numAb].id + '.png')
				.addField('**' + abilityArg.toUpperCase() + '**: ' + champion.spells[numAb].name, champion.spells[numAb].description.replace(/<br>/g, '\n').replace(/<[^>]+>/g, '*'))
				.setTimestamp()
				.setFooter('Nexus.gg')
			);
		}
	},
};