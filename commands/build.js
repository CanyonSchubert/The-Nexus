const puppeteer = require('puppeteer');
const ChampionAPI = require('../models/ChampionModel');
const Discord = require('discord.js');
const { callbackify } = require('util');

module.exports = {
    name : 'build',
    aliases : ['runes', 'masteries', 'items', 'skillorder'],
    description : 'This command will return the user with essentially build information for the given champion.',
    args : true,
    argoptions : ['[champion] [role]'],
    usage : 'build [champion] [role]',
    cooldown : 0,
    async execute(message, args) {
        const { devMode } = require('../appConfig.json');

            // Valid entries for the mandatory role argument
        const validRoles = ['top','jungle','middle','adc','support']; // TODO: allow for normalized roles like "bot" or "mid"

            // Sets and checks the role arg
        var championRole = args.pop();
        if (!validRoles.includes(championRole)) {
            message.channel.send("Please enter a valid role after your champion name. These include top, jungle, middle, adc, and support.");
            return;
        }

            // Gets, checks, and cleans the champion enters
        var champion = await ChampionAPI.getChampionByName(args);
        if (champion == "Champion not found.") {
			message.channel.send("I can\'t find that champion, please try again.");
			return;
		}
        var championName = this.specialClausesCheck(champion.name);

            // Puppeteer scraping of u.gg
        var uggHttpHijackStr = 'https://u.gg/lol/champions/' + championName + '/build?region=kr&role=' + championRole;
        const browser = await puppeteer.launch( { headless : true } );
        const page = await browser.newPage();
        await page.goto(uggHttpHijackStr, {waitUntil:'domcontentloaded'});
        var payload = await page.evaluate(this.pageEvaluation);
        if (devMode.isOn) console.log(payload);
        //browser.close();

            // ReactionCollector Setup
        const reactionHome = '🏠';
        const reactionRunes = '🇷'
        const reactionSkills = '🇸';
        const reactionItems = '🇮';
        const reactionNav = [reactionHome, reactionRunes, reactionSkills, reactionItems];
        const killTimer = 3600000;

            // Reaction Collector constructor
        function attachReactionCollector(message) {
            const reactionCollector = message.createReactionCollector(filter, { time : killTimer, dispose : true });
            reactionCollector.on('collect', reaction => {
                onCollect(reaction.emoji, message);
            });
            reactionCollector.on('remove', reaction => {
                onCollect(reaction.emoji, message);
            });
            reactionCollector.on('end', () => {
                message.reactions.removeAll();                
            });
        }

            // Reaction Collector onCollect
        function onCollect(emoji, message) {
            if (emoji.name === reactionHome) {
                message.edit(homeEmbed);
            }
            if (emoji.name === reactionRunes) {
                message.edit(runesFirstEmbed);
            }
            if (emoji.name === reactionSkills) {
                message.edit();
            }
            if (emoji.name === reactionItems) {
                message.edit();
            }
        }

            // Reaction Collector filter
        function filter(reaction, user) {
            return !user.bot && user.id == message.author.id && reactionNav.includes(reaction.emoji.name);
        }

            // Embed messages set up and return
        var homeEmbed = new Discord.MessageEmbed()
            .setTitle(champion.name + ' - ' + championRole.charAt(0).toUpperCase() + championRole.substring(1, championRole.length))
            .setColor('#2e8fc2')
            .setAuthor('Information from U.GG', null, uggHttpHijackStr)
            .setThumbnail(payload.championThumbnail)
            .addField('Win Rate', payload.championWinRate, true)
            .addField('Pick Rate', payload.championPickRate, true)
            .addField('Ban Rate', payload.championBanRate, true)
            .addField('Total Matches', payload.championTotalMatches)
            .setImage('https://static.u.gg/assets/ugg/logo/ugg-logo.svg')
            .setTimestamp()
            .setFooter('Nexus.gg')
        ;

        var runesFirstEmbed = new Discord.MessageEmbed()
            .setTitle(champion.name + ' - ' + championRole.charAt(0).toUpperCase() + championRole.substring(1, championRole.length))
            .setColor('#2e8fc2')
            .setAuthor('Information from U.GG', null, uggHttpHijackStr)
            .setThumbnail(payload.runeTreePrimaryKeystoneImage)
            .addField('Keystone', payload.runeTreePrimaryKeystone.split('The Keystone ')[1], true)
            .setImage('https://static.u.gg/assets/ugg/logo/ugg-logo.svg')
            .setTimestamp()
            .setFooter('Nexus.gg')
        ;

        // TODO: runes embeds, skills embeds, items embeds

        return message.channel.send(homeEmbed)
            .then(message => message.react(reactionHome))
            .then(messageReaction => messageReaction.message.react(reactionRunes))
            .then(messageReaction => messageReaction.message.react(reactionSkills))
            .then(messageReaction => messageReaction.message.react(reactionItems))
            .then(messageReaction => attachReactionCollector(messageReaction.message))
            ;
    },
    pageEvaluation() {
        console.log('PUPPETEER ENTRY POINT');
        var payloadObject = {

            championThumbnail : document.getElementsByClassName('champion-image')[0].src,
            championWinRate : document.getElementsByClassName('content-section champion-ranking-stats')[0].getElementsByClassName('value')[0].textContent,
            championPickRate : document.getElementsByClassName('content-section champion-ranking-stats')[0].getElementsByClassName('value')[2].textContent,
            championBanRate : document.getElementsByClassName('content-section champion-ranking-stats')[0].getElementsByClassName('value')[3].textContent,
            championTotalMatches : document.getElementsByClassName('content-section champion-ranking-stats')[0].getElementsByClassName('value')[4].textContent,

            runeTreePrimary : document.getElementsByClassName('rune-tree_header')[0].getElementsByClassName('perk-style-title')[0].textContent,
            runeTreePrimaryImage : document.getElementsByClassName('rune-tree_header')[0].getElementsByClassName('rune-image-container')[0].children[0].src,
            runeTreePrimaryKeystone : document.getElementsByClassName('perk keystone perk-active')[0].children[0].alt,
            runeTreePrimaryKeystoneImage : document.getElementsByClassName('perk keystone perk-active')[0].children[0].src,
            runeTreePrimaryRowOne : document.getElementsByClassName('rune-tree_v2 primary-tree')[0].getElementsByClassName('perk-row')[0].getElementsByClassName('perk perk-active')[0].children[0].alt,
            runeTreePrimaryRowOneImage : document.getElementsByClassName('rune-tree_v2 primary-tree')[0].getElementsByClassName('perk-row')[0].getElementsByClassName('perk perk-active')[0].children[0].src,
            runeTreePrimaryRowTwo : document.getElementsByClassName('rune-tree_v2 primary-tree')[0].getElementsByClassName('perk-row')[1].getElementsByClassName('perk perk-active')[0].children[0].alt,
            runeTreePrimaryRowTwoImage : document.getElementsByClassName('rune-tree_v2 primary-tree')[0].getElementsByClassName('perk-row')[1].getElementsByClassName('perk perk-active')[0].children[0].src,
            runeTreePrimaryRowThree : document.getElementsByClassName('rune-tree_v2 primary-tree')[0].getElementsByClassName('perk-row')[2].getElementsByClassName('perk perk-active')[0].children[0].alt,
            runeTreePrimaryRowThreeImage : document.getElementsByClassName('rune-tree_v2 primary-tree')[0].getElementsByClassName('perk-row')[2].getElementsByClassName('perk perk-active')[0].children[0].src,
            runeTreeSecondary : document.getElementsByClassName('rune-tree_header')[1].getElementsByClassName('perk-style-title')[0].textContent,
            runeTreeSecondaryImage : document.getElementsByClassName('rune-tree_header')[1].getElementsByClassName('rune-image-container')[0].children[0].src,
            runeTreeSecondaryFirstChoice : document.getElementsByClassName('rune-tree_v2')[1].getElementsByClassName('perk perk-active')[0].children[0].alt,
            runeTreeSecondaryFirstChoiceImage : document.getElementsByClassName('rune-tree_v2')[1].getElementsByClassName('perk perk-active')[0].children[0].src,
            runeTreeSecondarySecondChoice : document.getElementsByClassName('rune-tree_v2')[1].getElementsByClassName('perk perk-active')[1].children[0].alt,
            runeTreeSecondarySecondChoiceImage : document.getElementsByClassName('rune-tree_v2')[1].getElementsByClassName('perk perk-active')[1].children[0].src,
            runeTreeShardOne : document.getElementsByClassName('rune-tree_v2 stat-shards-container_v2')[0].getElementsByClassName('perk-row stat-shard-row')[0].getElementsByClassName('shard shard-active')[0].children[0].alt,
            runeTreeShardOneImage : document.getElementsByClassName('rune-tree_v2 stat-shards-container_v2')[0].getElementsByClassName('perk-row stat-shard-row')[0].getElementsByClassName('shard shard-active')[0].children[0].src,
            runeTreeShardTwo : document.getElementsByClassName('rune-tree_v2 stat-shards-container_v2')[0].getElementsByClassName('perk-row stat-shard-row')[1].getElementsByClassName('shard shard-active')[0].children[0].alt,
            runeTreeShardTwoImage : document.getElementsByClassName('rune-tree_v2 stat-shards-container_v2')[0].getElementsByClassName('perk-row stat-shard-row')[1].getElementsByClassName('shard shard-active')[0].children[0].src,
            runeTreeShardThree : document.getElementsByClassName('rune-tree_v2 stat-shards-container_v2')[0].getElementsByClassName('perk-row stat-shard-row')[2].getElementsByClassName('shard shard-active')[0].children[0].alt,
            runeTreeShardThreeImage : document.getElementsByClassName('rune-tree_v2 stat-shards-container_v2')[0].getElementsByClassName('perk-row stat-shard-row')[2].getElementsByClassName('shard shard-active')[0].children[0].src,
            summonerSpellOne : document.getElementsByClassName('content-section_content summoner-spells')[0].children[1].children[0].alt,
            summonerSpellOneImage : document.getElementsByClassName('content-section_content summoner-spells')[0].children[1].children[0].src,
            summonerSpellTwo : document.getElementsByClassName('content-section_content summoner-spells')[0].children[1].children[1].alt,
            summonerSpellTwoImage : document.getElementsByClassName('content-section_content summoner-spells')[0].children[1].children[1].src,

            skillMaxFirst : document.getElementsByClassName('champion-skill-with-label')[0].children[1].textContent,
            skillMaxFirstImage : document.getElementsByClassName('champion-skill-with-label')[0].children[0].src,
            skillMaxSecond : document.getElementsByClassName('champion-skill-with-label')[1].children[1].textContent,
            skillMaxSecondImage : document.getElementsByClassName('champion-skill-with-label')[1].children[0].src,
            skillMaxThird : document.getElementsByClassName('champion-skill-with-label')[2].children[1].textContent,
            skillMaxThirdImage : document.getElementsByClassName('champion-skill-with-label')[2].children[0].src,
            skillPath : '',

            itemStartingOne : document.getElementsByClassName('content-section_content starting-items')[0].getElementsByClassName('item-img')[0].children[0].children[0].style,
            itemStartingTwo : document.getElementsByClassName('content-section_content starting-items')[0].getElementsByClassName('item-img')[1].children[0].children[0].style,
            itemCoreOne : document.getElementsByClassName('content-section_content core-items')[0].getElementsByClassName('item-img')[0].children[0].children[0].style,
            itemCoreTwo : document.getElementsByClassName('content-section_content core-items')[0].getElementsByClassName('item-img')[1].children[0].children[0].style,
            itemCoreThree : document.getElementsByClassName('content-section_content core-items')[0].getElementsByClassName('item-img')[2].children[0].children[0].style,
            itemFourthOne : document.getElementsByClassName('content-section_content item-options item-options-1')[0].getElementsByClassName('item-img')[0].children[0].children[0].style,
            itemFourthTwo : document.getElementsByClassName('content-section_content item-options item-options-1')[0].getElementsByClassName('item-img')[1].children[0].children[0].style,
            itemFifthOne : document.getElementsByClassName('content-section_content item-options item-options-2')[0].getElementsByClassName('item-img')[0].children[0].children[0].style,
            itemFifthTwo : document.getElementsByClassName('content-section_content item-options item-options-2')[0].getElementsByClassName('item-img')[1].children[0].children[0].style,
            itemFifthThree : document.getElementsByClassName('content-section_content item-options item-options-2')[0].getElementsByClassName('item-img')[2].children[0].children[0].style,
            itemSixthOne : document.getElementsByClassName('content-section_content item-options item-options-3')[0].getElementsByClassName('item-img')[0].children[0].children[0].style,
            itemSixthTwo : document.getElementsByClassName('content-section_content item-options item-options-3')[0].getElementsByClassName('item-img')[1].children[0].children[0].style,
            itemSixthThree : document.getElementsByClassName('content-section_content item-options item-options-3')[0].getElementsByClassName('item-img')[2].children[0].children[0].style
        };

            // SkillPath calculations
        var skillPath = document.getElementsByClassName('skill-path-container')[0];
        var skillOrderRows = skillPath.children;

        var skillQ = [];
        var skillW = [];
        var skillE = [];
        var skillR = [];
        var skills = [skillQ, skillW, skillE, skillR];
        var skillChars = ['Q', 'W', 'E', 'R'];
        var skillOrder = [];

        for (var i = 0; i < skills.length; ++i) {
            var skillOrderRow = skillOrderRows.item(i);
            for (var k = 0; k < 18; ++k) {
                skills[i].push(skillOrderRow.children[1].children[k].className);
            }
            console.log(skills[i]);
        }
        for (var i = 0; i < 18; ++i) {
            for (var j = 0; j < skills.length; ++j) {
                //console.log(skills[j][i]);
                if (skills[j][i] != 'no-skill-up') {
                    skillOrder.push(skillChars[j]);
                    break;
                }
            }
        }
        payloadObject.skillPath = skillOrder;

            // Item Payload Calculations

            // Returns the payload from U.GG
        return payloadObject;
    },
    specialClausesCheck(name) {

        var checkedName = name;

            // THE SPACED NAME CLAUSE
        if (checkedName.includes(' ')) {
            var hold = checkedName.split(' ');
            checkedName = hold.join('');
        }
            // THE VOID CLAUSE
        if (checkedName.includes('\'')) {
            var hold = checkedName.split('\'');
            checkedName = hold.join('');
        }
            // THE NUNU & WILLUMP CLAUSE
        if (checkedName.includes('&')) {
            var hold = checkedName.split('&');
            checkedName = hold[0];
        }
            // THE DR. MUNDO CLAUSE
        if (checkedName.includes('.')) {
            var hold = checkedName.split('.');
            checkedName = hold.join('');
        }

        return checkedName;
    },
}