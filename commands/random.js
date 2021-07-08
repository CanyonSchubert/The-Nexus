const Champion = require('../Models/ChampionModel');
const Discord = require('discord.js');

module.exports = {
	name: 'random',
	description: 'Returns a random champ!',
	async execute(message, args) {
		var champion;
		try {
			champion = await Champion.getRandomChampion();
		} catch (error) {
			console.log(error);
			return message.channel.send('The randomizer misfired, play the dumbest champion you can think of.');
		}
		
		//console.log(champion);
		
		const embedRandom = new Discord.MessageEmbed()
			.setColor('#2e8fc2')
			.setTitle('Randomizer')
			.addField('Your random champion is:', champion.name)
			.setThumbnail()
			.setImage('http://ddragon.leagueoflegends.com/cdn/' + champion.version + '/img/champion/' + champion.id + '.png')
			.setTimestamp()
			.setFooter('Nexus.gg');
			
		//console.log(embedRandom);	
	
		message.channel.send(embedRandom);					
	},
};