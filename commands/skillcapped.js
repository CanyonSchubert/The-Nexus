var Youtube = require('https://www.googleapis.com/youtube/v3');

module.exports = {
    name: 'skillcapped',
    aliases: [],
    description: 'This command will return the most relevant Skillcapped video based on your search.',
    args: true,
    argoptions: ['[search]'],
    usage: prefix + 'skillcapped [search]',
    cooldown: 10,
    async execute(message, args) {

        if (!args.length) {
            return message.reply('You must provide an argment with this command. Try adding something to search for after the command.');
        }

        args = args.join(' ');

        var searchResults = Youtube.Search.list('id,snippet', {q: args, maxResults: 1});

        console.log(searchResults.items);

    }
}