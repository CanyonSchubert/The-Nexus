const { prefix } = require('../auth.json');
const Discord = require('discord.js');

module.exports = {
	name: 'help',
	aliases: [],
	description: 'This command lists out all other commands. If given a command as an argument, it will give details about that command.',
	args: false,
	argoptions: ['[command]'],
	usage: prefix + 'help **OR** ' + prefix + 'help [command]',
	cooldown: 0,
	async execute(message, args) {
		
		const { client } = require('../bot.js');
		const data = [];
		const { commands } = message.client;
		
		if (!args.length) {
			data.push('Here\'s a list of all usable commands:\n');
			data.push(commands.map(command => command.name).join(', '));
			data.push('\nYou can also use "' + prefix + 'help [command]" for a description of a specific command.');
			
			return message.author.send(data, { split: true })
				.then(() => {
					if (message.channel.type == 'dm') return;
					message.reply('check your DMs.');
				})
				.catch(error => {
					console.error(error);
					message.reply('I can\'t DM you; please make sure you have DMs turned on.');
				})
		}
		
		const name = args[0].toLowerCase();
		const command = commands.get(name);
		
		if (!command) {
			return message.reply('I don\'t know that command.');
		}
		
		data.push('**Name**: ' + command.name);
		
		if (command.aliases) data.push('**Aliases**: ' + command.aliases.join(', '));
		if (command.description) data.push('**Description**: ' + command.description);
		if (command.args) data.push('**Arguments**: Required');
		if (command.argoptions) data.push('**Valid Arguments**: ' + command.argoptions.join(', '));
		if (command.usage) data.push('**Usage**: ' + command.usage);
		if (command.cooldown) data.push('**Cooldown**: ' + command.cooldown);
		
		var val = '';
		for (var x in data) {
			val += data[x] + '\n';
		}
		
		const embedHelp = new Discord.MessageEmbed()
			.setColor('#FFD100')
			.setTitle('Help')
			.setAuthor('The Nexus')
			.addField(prefix + command.name, val)
			.setTimestamp()
			.setFooter('Goosey Solutions ™');
			
		message.author.send(embedHelp);
	},
};