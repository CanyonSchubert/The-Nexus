const puppeteer = require('puppeteer');
const ChampionAPI = require('../models/ChampionModel');
const Discord = require('discord.js');

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
        const validRoles = ['top','jungle','middle','adc','support'];

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
        const browser = await puppeteer.launch( { headless : false } );
        const page = await browser.newPage();
        await page.goto(uggHttpHijackStr, {waitUntil:'domcontentloaded'});
        var payload = await page.evaluate(this.pageEvaluation);
        if (devMode.isOn) console.log(payload);
        browser.close();

            // Embed messages set up and return
        var nextEmbed = new Discord.MessageEmbed()
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
        return message.channel.send(nextEmbed);
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
            /*runeTreePrimaryKeystone : ,
            runeTreePrimaryKeystoneImage : ,
            runeTreePrimaryRowOne : ,
            runeTreePrimaryRowOneImage : ,
            runeTreePrimaryRowTwo : ,
            runeTreePrimaryRowTwoImage : ,
            runeTreePrimaryRowThree : ,
            runeTreePrimaryRowThreeImage : ,
            runeTreeSecondary : document.getElementsByClassName('rune-tree_header')[0].getElementsByClassName('perk-style-title')[0].textContent,
            runeTreeSecondaryImage : document.getElementsByClassName('rune-tree_header')[0].getElementsByClassName('rune-image-container')[0].children[0].src,
            runeTreeSecondaryFirstChoice : ,
            runeTreeSecondaryFirstChoiceImage : ,
            runeTreeSecondarySecondChoice : ,
            runeTreeSecondarySecondChoiceImage : ,
            runeTreeShardOne : ,
            runeTreeShardOneImage : ,
            runeTreeShardTwo : ,
            runeTreeShardTwoImage : ,
            runeTreeShardThree : ,
            runeTreeShardThreeImage : ,
            summonerSpellOne : ,
            summonerSpellOneImage : ,
            summonerSpellTwo : ,
            summonerSpellTwoImage : ,*/
        };

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