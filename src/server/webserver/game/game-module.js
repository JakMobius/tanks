
const WebserverModule = require("../webserver-module");
const path = require("path")

class GameModule extends WebserverModule {
    constructor(config) {
        super(config);

        this.resourcesDirectory = path.resolve(__dirname, "../../client/game/page/")
    }
}

module.exports = GameModule;