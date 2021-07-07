const { prefix, devMode } = require('../appConfig.json');

module.exports =  {

    async execute() {

        const { client } = require('../bot.js');

            // DEV MODE: Bot sends current working command on startup
        if (devMode.isOn && devMode.autoTest && devMode.autoTestChannel) {
            var autoTestChannel = client.channels.cache.get(devMode.autoTestChannel);
            autoTestChannel.send(prefix + devMode.workingCmd);
        }
    }
}