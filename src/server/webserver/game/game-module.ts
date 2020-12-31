
import WebserverModule from '../webserver-module';
import path from 'path';
import express from 'express';

class GameModule extends WebserverModule {
    constructor(config?) {
        super(config);

        this.resourcesDirectory = path.resolve(__dirname, "../../../client/game/page/")

        this.router.get("/game/", (req, res, next) => {
            res.render("game/page/index")
        })

        this.router.use("/game/styles/", express.static(this.resourcePath("styles")))
        this.router.use("/game/scripts/", express.static(this.resourcePath("scripts")))
    }
}

export default GameModule;