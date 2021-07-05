const { prefix } = require('../bot.js');
const GoogleAPI = require('');

module.exports = {
    name: 'skillcapped',
    aliases: [],
    description: 'This command will return the most relevant Skillcapped video based on your search.',
    args: true,
    argoptions: ['[search]'],
    usage: 'skillcapped [search]',
    cooldown: 10,
    async execute(message, args) {

        if (!args.length) {
            return message.reply('You must provide an argment with this command. Try adding something to search for after the command.');
        }

        args = args.join(' ');

        GoogleAPI.load("client", () => {
            GoogleAPI.client.setAPIKey('AIzaSyCXTeH5h1pGUjN-xDSeL1Nm4m1MnBBx8IA');
            return GoogleAPI.client.load('https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest')
                .then(() => {
                    console.log('GoogleAPI client loaded for API');
                }, (err) => {
                    console.log('Error loading GoogleAPI client for API.', err.stack);
                })
                
        });
        //console.log(searchResults.items);

    }
}