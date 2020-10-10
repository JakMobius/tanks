
const WebserverModule = require("../webserver-module");
const path = require("path")
const express = require("express")

class HubModule extends WebserverModule {
    constructor(config) {
        super(config);

        this.resourcesDirectory = path.resolve(__dirname, "../../../client/hub/page/")

        this.router.get("/hub/", (req, res, next) => {
            res.render("hub/page/index")
        })

        this.router.use("/hub/styles/", express.static(this.resourcePath("styles")))
        this.router.use("/hub/scripts/", express.static(this.resourcePath("scripts")))
    }
}

module.exports = HubModule;