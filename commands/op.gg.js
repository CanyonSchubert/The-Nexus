const { prefix } = require('../auth.json');
const Discord = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
	name: 'op.gg',
	aliases: ['opgg'],
	description: 'This is the base command for op.gg functions.',
	args: true,
	argoptions: ['[Summoner Name]'],
	usage: prefix + 'op.gg [Argument]',
	cooldown: 0,
	async execute(message, args) {
		const { client } = require('../bot.js');
		
		var httpStr = 'http://na.op.gg/summoner/userName=' + args[0];
		const res = await fetch(httpStr)
			.then(res => { console.log(res.text()); })
			.catch(err => { console.log('Error obtaining summoner information from op.gg: ' + err ); });
	},
};