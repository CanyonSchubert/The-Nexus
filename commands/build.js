const puppeteer = require('puppeteer');
const ChampionAPI = require('../models/ChampionModel');
const Discord = require('discord.js');

module.exports = {
    name : 'build',
    alias  : ['runes', 'masteries', 'items', 'skillorder'],
    description : 'This command will return the user with essentially build information for the given champion.',
    args : true,
    argoptions : ['[champion] [role]'],
    usage : 'build [champion] [role]',
    cooldown : 0,
    async execute(message, args) {
        const { devMode } = require('../appConfig.json');

        const validRoles = ['top','jungle','mid','bot','support'];

        var championRole = args.pop();
        if (!validRoles.includes(championRole)) {
            message.channel.send("Please enter a valid role after your champion name. These include top, jungle, mid, bot, and support.");
            return;
        }

        var champion = await ChampionAPI.getChampionByName(args);
        if (champion == "Champion not found.") {
			message.channel.send("I can\'t find that champion, please try again.");
			return;
		}

        var championName = this.specialClausesCheck(champion.name);

        var uggHttpHijackStr = 'https://u.gg/lol/champions/' + championName + '/build?role=' + championRole;
        const browser = await puppeteer.launch({headless:false});
        const page = await browser.newPage();
        await page.goto(uggHttpHijackStr, {waitUntil:'domcontentloaded'});

        var payload = await page.evaluate(this.pageEvaluation);
        console.log(payload);

        //console.log((await page.content()).split('champion-image')[1].substring(0, 100));

        //var embedList = [];
        var nextEmbed = new Discord.MessageEmbed()
            .setTitle(champion.name)
            .setThumbnail(payload.championThumbnail)
        ;
        return message.channel.send(nextEmbed);
        /*embedList.push(nextEmbed);

        for (embed in embedList) {
            message.channel.send(embed);
        }
        return;*/
    },
    pageEvaluation() {
        console.log('PUPPETEER ENTRY POINT');
        var payloadObject = {
            championThumbnail : document.getElementsByClassName('champion-image')[0].src
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