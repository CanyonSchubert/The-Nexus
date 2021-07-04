const { prefix } = require('../auth.json');
const ChampionAPI = require('../models/ChampionModel')

module.exports = {
	name: 'emojis',
	description: 'Refreshes the emoji storage servers used for the bot. Only usable by the bot creator.',
	cooldown: 259200,
	args: false,
	usage: prefix + 'emojis',
	async execute(message, args) {
		const client = require('../bot.js').client;
		
		const myID = '147858725233754112';
		const botID = '766914741758066688';
		if (message.author.id != myID && message.author.id != botID) {
			message.reply('you don\'t have permission to use this command.');
		}

		//console.log(client.guilds);
		//return;
		
		//needs to be updated once there are more than ~200 champions (also any other misc emoji for LE1)
			// look into automatically creating a new server if (total champions > (# of LEServers - 1) * 50)
		const LEServers = [ 
			(await client.guilds.fetch(client.guilds.cache.find(guild => guild.name === 'League Emojis 1').id)), 
			(await client.guilds.fetch(client.guilds.cache.find(guild => guild.name === 'League Emojis 2').id)), 
			(await client.guilds.fetch(client.guilds.cache.find(guild => guild.name === 'League Emojis 3').id)),
			(await client.guilds.fetch(client.guilds.cache.find(guild => guild.name === 'League Emojis 4').id)), 
			(await client.guilds.fetch(client.guilds.cache.find(guild => guild.name === 'League Emojis 5').id))
			];
			
		if (message.guild != LEServers[0] && message.guild != LEServers[1] && message.guild != LEServers[2] && message.guild != LEServers[3] && message.guild != LEServers[4]) {
			LEServers[0].channels.cache.get(LEServers[0].channels.cache.find(channel => channel.name === 'general').id).send(prefix + 'emojis');
			LEServers[1].channels.cache.get(LEServers[1].channels.cache.find(channel => channel.name === 'general').id).send(prefix + 'emojis');
			LEServers[2].channels.cache.get(LEServers[2].channels.cache.find(channel => channel.name === 'general').id).send(prefix + 'emojis');
			LEServers[3].channels.cache.get(LEServers[3].channels.cache.find(channel => channel.name === 'general').id).send(prefix + 'emojis');
			LEServers[4].channels.cache.get(LEServers[4].channels.cache.find(channel => channel.name === 'general').id).send(prefix + 'emojis');
			return message.channel.send('Refreshing my emojis... (this may take a while, please be patient)');
		}
		
		const emojiServer = message.guild;

		// for now...
		if (emojiServer === LEServers[0]) {
			return message.reply('The emojis in this channel are sacred and must be refreshed manually. :rage:');
		}

		const toDelete = emojiServer.emojis.cache.map(emoji => emoji);
		var delPromises = [];
		console.log(emojiServer.name + ': ' + toDelete.length + ' emojis exist.');
		for (var i = 0; i < toDelete.length; ++i) {
			try {
				var x = emojiServer.emojis.cache.find(emoji => emoji === toDelete[i]).name;
				delPromises.push(toDelete[i].delete());
				console.log(emojiServer.name + ': Emoji deletion queued for ' + x);
				message.channel.send(x + '\'s emoji has been queued for deleted.');
			} catch (error) {
				console.log('Error deleting emoji: "' + error.stack + '"');
			}
		}
		console.log(emojiServer.name + ': ' + delPromises.length + ' deletion promises now exist\n');
		await Promise.all(delPromises);
		console.log(emojiServer.name + ': All emojis deleted\n');
		
		//champion emoji servers are LEServers[1+], LEServers[0] is reserved for special emojis like mastery crests. (look into automating LEServer[0])
		switch(emojiServer) {
			
			case LEServers[1]:

                await this.emojiCreation(0, 50, message);
				break;
				
			case LEServers[2]:

				await this.emojiCreation(50, 100, message);
                break;
			
			case LEServers[3]:
			
				await this.emojiCreation(100, 150, message);
                break;
			
			case LEServers[4]:
			
				await this.emojiCreation(150, 200, message);
				break;
		}
		
		console.log('Emoji refresh has been executed for: ' + emojiServer.name);
		message.channel.send('the emojis here have been renewed! :relieved:');
	},
    specialClausesCheck(name) {

        var checkedName = name;

            // THE SPACED NAME CLAUSE
        if (checkedName.includes(' ')) {
            var hold = checkedName.split(' ');
            checkedName = hold.join('_');
        }
            // THE VOID CLAUSE
        if (checkedName.includes('\'')) {
            var hold = checkedName.split('\'');
            checkedName = hold.join('');
        }
            // THE NUNU & WILLUMP CLAUSE
        if (checkedName.includes('&')) {
            var hold = checkedName.split('&');
            checkedName = hold.join('_and_');
        }
            // THE DR. MUNDO CLAUSE
        if (checkedName.includes('.')) {
            var hold = checkedName.split('.');
            checkedName = hold.join('');
        }

        return checkedName;
    },
    async emojiCreation(minIndex, maxIndex, message) {

		var emojiServer = message.guild;
        var raw = await ChampionAPI.getAllRawVersionsAndChampionsData();
		var addPromises = [];

        for (var i = minIndex; i < maxIndex; ++i) {
					
            try {
                var champion = raw.champions.data[(Object.keys(raw.champions.data)[i])];
            } catch (error) {
                console.log('Champion from index 0-49 not found: "' + error.stack + '"');
            }
            
            champion.name = this.specialClausesCheck(champion.name);
			console.log(champion.name);
            
            try {
                addPromises.push(emojiServer.emojis.create('http://ddragon.leagueoflegends.com/cdn/' + raw.version + '/img/champion/' + champion.image.full, champion.name)
                    .then(emoji => {
                        console.log(emojiServer.name + ': Emoji created for ' + emoji.name);
                        message.channel.send('Emoji created for: ' + emoji.toString());
                    }));
            } catch (error) {
                console.log('Error creating emoji: "' + error.stack + '"');
            }
        }
        
        console.log(emojiServer.name + ': ' + addPromises.length + ' creation promises exist.\n');
        await Promise.all(addPromises);
        console.log(emojiServer.name + ': All emojis created!\n');
    }
};