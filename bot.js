	// Imports

const fs = require('fs');
const fetch = require('fetch');
const Discord = require('discord.js');
const {token, riot_api_key, prefix } = require('./auth.json');
const { devMode } = require('./appConfig.json');
const AutoTest = require('./dev-functions/AutoTest');

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

		// DEV MODE: AutoTest
	if (devMode.isOn) {
		AutoTest.execute();
	}
});

client.login(token);

module.exports = { 
	client : client,
 };

	// Message Handler

client.on('message', message => {

		// Ignores messages from bots that aren't itself

	if (message.author.bot && message.author.id != '766914741758066688')
		return;
	
		// Ignores messages that don't start with the bot prefix
	
	if (!(message.content.substring(0, prefix.length) == prefix && message.content != prefix)) {
		return;
	}

		// Sets up the command name and args

	let args = message.content.substring(prefix.length).split(/ +/);
	const commandName = args[0].toLowerCase();
	args = args.splice(1);

		// Sets up high level bot variables

	var youtubeQuota = 0;

		// Sets up console logs for each request

	console.log("\nRequest ID: " + requestID + ' (Opened)');
	console.log('Request Author Tag: ' + message.author.tag + ' (' + message.author.id + ')');
	if (message.guild)
		console.log('Request Location: ' + message.guild.name + ' (' + message.guild.id + ')');
	else 
		console.log('Request Location: DM');
	
	console.log('Command: ' + commandName);
	console.log('Argument: ' + args);

		// If command doesn't exist

	if (!client.commands.has(commandName)) return message.reply('use "' + prefix + 'help" for a list of commands.');
	
		// Basic command set up

	const cmd = client.commands.get(commandName);
	
	if (cmd.guildOnly && message.channel.type != 'text') {
		return message.reply('this command can\'t be used in DMs!');
	}
	
	if (cmd.args && !args.length) {
		let reply = 'this command requires arguments to be provided for it.';
		
		if (cmd.usage) {
			reply += '\nex. ```' + prefix + cmd.usage + '```';
		}
		
		return message.reply(reply);
	}

		// Pre-command handling

	if (commandName == "skillcapped") { // Add OR statements for any other commands adding to the youtube quota.
		++youtubeQuota;
	}
	if (youtubeQuota > 100) {
		return message.reply('Sorry, I\'ve reached my YouTube quota limit for the day. Please try again tomorrow.');
	}

		// Command cooldown and expiry
	
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

		// Command execution
	
	try {
		cmd.execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute your command!');
	}

		// Post-command handling
	
	console.log('Request ID: ' + requestID + ' (Handled)\n');
	++requestID;
});