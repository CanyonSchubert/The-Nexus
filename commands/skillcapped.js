/**
 * Used this tutorial for accessing YouTube API: https://www.youtube.com/watch?v=QCWhmN1Qcjw&ab_channel=AnsontheDeveloper
 * Used this link for Reaction Collector: https://stackoverflow.com/questions/57324773/how-to-edit-message-according-to-reaction-in-discord-js-create-a-list-and-switc
 */

const { youtube_api_key } = require('../auth.json');
const Youtube = require('youtube-search');
const Discord = require('discord.js');

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

            // Appends 'Skill Capped' to the end of the user's search query, ensuring more relevant results

        var query = args.join(' ') + ' Skill Capped';

            /**
             * channelId : Skill Capped Challenger LoL Guides
             * maxResults : Maximum amount of search results returned
             * publishedAfter : Only return search results published after this value
             * key : YouTube Data v3 API Key
             * 
             * Other Optional Parameters: https://developers.google.com/youtube/v3/docs/search/list
             */
        var searchOptions = {
            //channelId : 'UCFl1mGlf5j0Qno1Kxnyv6FA',
            maxResults : 100,
            publishedAfter : '2021-01-01T00:00:01+00:00',
            key : youtube_api_key
        }

            // YouTube search query

        console.log('Searching YouTube for: "' + query + '"');
        let searchResults = await Youtube(query, searchOptions)
            .catch((error) => {
                console.log('Error searching for SkillCapped video: "' + error.stack + '"');
                if (error.stack.includes('quotaExceeded')) {
                    return message.reply('I have met my daily YouTube search limit. I\'m very sorry, please try again tomorrow.');
                }
            })

            // Filters out any results not on a Skill Capped channel (unless, someone else has Skill Capped in their channel name)

        var searchIndex = 0;
        while (searchIndex < searchResults.results.length) {
            if (!searchResults.results[searchIndex].channelTitle.includes('Skill Capped'))
                searchResults.results.splice(searchIndex, 1);
            else 
                ++searchIndex;
        }
        //console.log(searchResults);

            // Compiling Output and Replying

        if (searchResults.results.length > 0) {

            const reactionNext = '➡️';
            const reactionPrev = '⬅️';
            const reactionLimits = '⛔';
            const reactionNav = [reactionPrev, reactionNext];
            const killTimer = 1200000;

            console.log('Displaying the link to: "' + searchResults.results[0].title + '" from ' + searchResults.results[0].channelTitle);
            message.reply('here is the Skill Capped video most relevant to your search! If you would like a different video with the same search, use the navigation reactions under the video preview.');
            return message.channel.send(searchResults.results[0].link)
                .then(message => message.react(reactionPrev))
                .then(messageReaction => messageReaction.message.react(reactionNext))
                .then(messageReaction => attachReactionCollector(messageReaction.message));

                // Reaction Collector constructor

            function attachReactionCollector(message) {
                let replySearchIndex = 0;
                const reactionCollector = message.createReactionCollector(filter, { time : killTimer, dispose : true });
                reactionCollector.on('collect', reaction => {
                    replySearchIndex = onCollect(reaction.emoji, message, replySearchIndex);
                });
                reactionCollector.on('remove', reaction => {
                    replySearchIndex = onCollect(reaction.emoji, message, replySearchIndex);
                });
                reactionCollector.on('end', () => {
                    message.clearReactions();
                });
            }

                // OnCollect function for the Reaction Collector

            function onCollect(emoji, message, replySearchIndex) {
                if (emoji.name === reactionPrev && replySearchIndex > 0) {
                    message.edit(searchResults.results[--replySearchIndex].link);
                    console.log('Displaying the link to: "' + searchResults.results[replySearchIndex].title + '" from ' + searchResults.results[replySearchIndex].channelTitle);
                }
                else if (emoji.name === reactionNext && replySearchIndex < searchResults.results.length - 1) {
                    message.edit(searchResults.results[++replySearchIndex].link);
                    console.log('Displaying the link to: "' + searchResults.results[replySearchIndex].title + '" from ' + searchResults.results[replySearchIndex].channelTitle);
                }
                else if ((emoji.name === reactionPrev && replySearchIndex == 0) || (emoji.name === reactionNext && replySearchIndex == searchResults.results.length - 1)) {
                    message.react(reactionLimits)
                        .then(messageReaction => messageReaction.message.reactions.removeAll())
                        .then(() => message.react(reactionPrev))
                        .then(() => message.react(reactionNext));
                }
                return replySearchIndex;
            }

                // Filter function for the Reaction Collector

            function filter(reaction, user) {
                return !user.bot && reactionNav.includes(reaction.emoji.name);
            }
        }
        else {
            return message.reply('I wasn\'t able to find any results for that search. Please broaden your search terms and try again.');
        }
    }
}
