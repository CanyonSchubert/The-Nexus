const { prefix } = require('../auth.json');

module.exports =  {

    async execute() {

        const { client, devModeOptions } = require('../bot.js');

            // DEV MODE: Bot sends current working command on startup
        if (devModeOptions.devMode && devModeOptions.autoTest && devModeOptions.autoTestChannel) {
            var autoTestChannel = client.channels.cache.get(devModeOptions.autoTestChannel);
            autoTestChannel.send(prefix + devModeOptions.workingCmd);
        }
    }
}