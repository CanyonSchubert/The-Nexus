const { prefix } = require('../auth.json');
const AutoTest = require('../dev-functions/AutoTest');

module.exports = {
	name: 'reload',
    aliases: ['refresh'],
	description: 'Reload a command!',
	args: true,
    argoptions: ['[command]'],
	usage: 'reload [command]',
    cooldown: 10,
	execute(message, args) {
		const { client, devModeOptions } = require('../bot.js');
		
		const commandName = args[0].toLowerCase();
		const cmd = client.commands.get(commandName);
		const myID = '147858725233754112';
		
		if (!cmd && !args[1]) {
			return message.channel.send('I don\'t have that command.');
		}
		else if (!cmd && args[1] == '--save') {
			return message.reply('you don\'t have permission to execute this command.');
		}
        else if (!cmd && args[1] == '--save' && message.author.id == myID) {
			// skips the delete statement and just adds a new command
			console.log('Adding a new command');
		}
		else {
			delete require.cache[require.resolve('./' + commandName + '.js')];
            console.log('Deleting ' + commandName + '.js');
		}
		
		try {
			const newCmd = require('./' + commandName + '.js');
			client.commands.set(newCmd.name, newCmd);
            console.log('Adding ' + commandName + '.js');
		} catch (error) {
			console.log('Error setting the new command: "' + error.stack + '"');
			return message.channel.send('An error occurred while trying to reload the command.');
		}

			// DEV MODE: AutoTest
		if (devModeOptions.devMode && commandName == devModeOptions.workingCmd) {
			AutoTest.execute();
		}

		message.channel.send('"' + prefix + commandName + '" was reloaded successfully!');
	},
};