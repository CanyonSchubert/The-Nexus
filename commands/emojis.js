const { prefix } = require('../auth.json');
const { client } = require('../bot.js');
const fetch = require('node-fetch');
const ChampionAPI = require('../models/ChampionModel')

module.exports = {
	name: 'emojis',
	description: 'Refreshes the emoji storage servers used for the bot. Only usable by the bot creator.',
	cooldown: 300,
	args: false,
	usage: prefix + 'emojis',
	async execute(message, args) {
		
		const myID = '147858725233754112';
		const botID = '766914741758066688';
		if (message.author.id != myID && message.author.id != botID) {
			message.reply('you don\'t have permission to use this command.');
		}
		
		//needs to be updated once there are more than ~200 champions (also any other misc emoji for LE1)
			// look into automatically creating a new server if (total champions > (# of LEServers - 1) * 50)
		const LEServers = [ client.guilds.get(client.guilds.find(guild => guild.name === 'League Emojis 1').id), 
			client.guilds.get(client.guilds.find(guild => guild.name === 'League Emojis 2').id), 
			client.guilds.get(client.guilds.find(guild => guild.name === 'League Emojis 3').id), // TODO: CLIENT.GUILDS NO LONGER EXISTS
			client.guilds.get(client.guilds.find(guild => guild.name === 'League Emojis 4').id), 
			client.guilds.get(client.guilds.find(guild => guild.name === 'League Emojis 5').id) 
			];

		if (message.guild != LEServers[0] && message.guild != LEServers[1] && message.guild != LEServers[2] && message.guild != LEServers[3] && message.guild != LEServers[4]) {
			client.guilds.get(LEServers[0].id).channels.get(LEServers[0].channels.find(channel => channel.name === 'general').id).send('lp!emojis');
			client.guilds.get(LEServers[1].id).channels.get(LEServers[1].channels.find(channel => channel.name === 'general').id).send('lp!emojis');
			client.guilds.get(LEServers[2].id).channels.get(LEServers[2].channels.find(channel => channel.name === 'general').id).send('lp!emojis');
			client.guilds.get(LEServers[3].id).channels.get(LEServers[3].channels.find(channel => channel.name === 'general').id).send('lp!emojis');
			client.guilds.get(LEServers[4].id).channels.get(LEServers[4].channels.find(channel => channel.name === 'general').id).send('lp!emojis');
			return message.channel.send('Refreshing my emojis... (this may take a while, please be patient)');
		}
		
		// for now...
		if (message.guild === LEServers[0]) {
			return message.reply('The emojis in this channel are sacred and must be refreshed manually. :rage:');
		}
		
		const emojiServer = message.guild;

		const toDelete = emojiServer.map(emoji => emoji.id);
		var delPromises = [];
		console.log(emojiServer + ': ' + toDelete.length + ' emojis exist.');
		for (var i = 0; i < toDelete.length; ++i) {
			try {
				var x = emojiServer.emojis.find(emoji => emoji.id === toDelete[i]).name;
				delPromises.push(emojiServer.deleteEmoji(toDelete[i]));
				console.log(emojiServer + ': Emoji deletion queued for ' + x);
				message.channel.send(x + '\'s emoji has been queued for deleted.');
			} catch (error) {
				console.log('Error deleting emoji: ' + error);
			}
		}
		console.log(emojiServer + ': ' + delPromises.length + ' deletion promises now exist.');
		await Promise.all(delPromises);
		console.log(emojiServer + ': All emojis deleted.');
		
		//champion emoji servers are LEServers[1+], LEServers[0] is reserved for special emojis like mastery crests. (look into automating LEServer[0])
		switch(emojiServer) {
			
			case LEServers[1]:

                this.emojiCreation(0, 50, emojiServer);
				break;
				
			case LEServers[2]:
			
				this.emojiCreation(50, 100, emojiServer);
                break;
			
			case LEServers[3]:
			
				this.emojiCreation(100, 150, emojiServer);
                break;
			
			case LEServers[4]:
			
				this.emojiCreation(150, 200, emojiServer);
				break;
		}
		
		console.log('Emoji refresh has been executed for: ' + emojiServer.name);
		message.channel.send('the emojis here have been renewed! :relieved:');
	},
    specialClausesCheck(name) {

        var checkedName = name;

            // THE SPACED NAME CLAUSE
        if (name.includes(' ')) {
            var hold = name.split(' ');
            name = hold.join('_');
        }
            // THE VOID CLAUSE
        if (name.includes('\'')) {
            var hold = name.split('\'');
            name = hold.join('');
        }
            // THE NUNU & WILLUMP CLAUSE
        if (name.includes('&')) {
            var hold = name.split('&');
            name = hold.join('_and_');
        }
            // THE DR. MUNDO CLAUSE
        if (name.includes('.')) {
            var hold = name.split('.');
            name = hold.join('');
        }

        return checkedName;
    },
    async emojiCreation(minIndex, maxIndex, emojiServer) {

        var raw = ChampionAPI.getAllRawVersionsAndChampionsData();
		var addPromises = [];

        for (var i = minIndex; i < maxIndex; ++i) {
					
            try {
                var champion = raw.champions.data[(Object.keys(raw.champions.data)[i])];
            } catch (error) {
                console.log('Champion from index 0-49 not found: ' + error);
            }
            
            champion.name = this.specialClausesCheck(champion.name);
            
            try {
                addPromises.push(emojiServer.createEmoji('http://ddragon.leagueoflegends.com/cdn/' + raw.version + '/img/champion/' + champion.image.full, champion.name)
                    .then(emoji => {
                        console.log(emojiServer + ': Emoji created for ' + emoji.name);
                        message.channel.send('Emoji created for: ' + emoji.toString());
                    }));
            } catch (error) {
                console.log('Error creating emoji: ' + error);
            }
        }
        
        console.log(emojiServer + ': ' + addPromises.length + ' creation promises exist.');
        await Promise.all(addPromises);
        console.log(emojiServer + ': All emojis created!');
    }
};