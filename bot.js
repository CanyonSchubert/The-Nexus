	// Imports

const fs = require('fs');
const fetch = require('fetch');
const Discord = require('discord.js');
const {token, api_key, prefix } = require('./auth.json');

	// Initializes Command Collection and Some Options
	
const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require('./commands/' + file);
	client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();

var requestID = 1;

	// Initializes Bot

client.once('ready', () => {
	console.log('Connected as: ' + client.user.username + '!\n');
});

client.login(token);

module.exports = { client };

	// Message Handler

client.on('message', message => {
	
		// Ignores messages that don't start with the bot prefix
	
	if (!(message.content.substring(0, prefix.length) == prefix && message.content != prefix)) {
		return;
	}

	console.log("\nRequest ID: " + requestID + ' (Opened)');
	console.log('Request Author Tag: ' + message.author.tag + ' (' + message.author.id + ')');
	console.log('Request Location: ' + message.guild.name + ' (' + message.guild.id + ')');
	
	let args = message.content.substring(prefix.length).split(/ +/);
	
	const commandName = args[0].toLowerCase();
	console.log('Command: ' + commandName);
	
	args = args.splice(1);
	console.log('Argument: ' + args);
	
	if (!client.commands.has(commandName)) return message.reply('use "' + prefix + 'help" for a list of commands.');
	
	const cmd = client.commands.get(commandName);
	
	if (cmd.guildOnly && message.channel.type != 'text') {
		return message.reply('this command can\'t be used in DMs!');
	}
	
	if (cmd.args && !args.length) {
		let reply = 'this command requires arguments to be provided for it.';
		
		if (cmd.usage) {
			reply += '\nex. ```' + prefix + cmd.name + ' ' + cmd.usage + '```';
		}
		
		return message.reply(reply);
	}
	
	if (!cooldowns.has(cmd.name)) {
		cooldowns.set(cmd.name, new Discord.Collection());
	}
	
	const now = Date.now();
	const timestamps = cooldowns.get(cmd.name);
	const cooldownAmount = (cmd.cooldown || 3) * 1000;
	
	if (timestamps.has(message.author.id) && !message.author.bot) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
		
		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply('please wait ' + timeLeft.toFixed(1) + ' seconds before using this command again.');
		}
	}
	
	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
	
	try {
		cmd.execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute your command!');
	}
	
	console.log('Request ID: ' + requestID + ' (Handled)\n');
	++requestID;
});