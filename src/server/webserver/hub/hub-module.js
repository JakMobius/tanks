
const WebserverModule = require("../webserver-module");
const path = require("path")
const express = require("express")

class HubModule extends WebserverModule {
    constructor(config) {
        super(config);

        this.resourcesDirectory = path.resolve(__dirname, "../../../client/game/page/")

        this.router.get("/game/", (req, res, next) => {
            res.render("game/page/index")
        })

        this.router.use("/game/styles/", express.static(this.resourcePath("styles")))
        this.router.use("/game/scripts/", express.static(this.resourcePath("scripts")))
    }
}

module.exports = HubModule;