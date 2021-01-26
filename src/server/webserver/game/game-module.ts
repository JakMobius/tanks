
import WebserverModule from '../webserver-module';
import * as path from 'path';
import * as express from 'express';

class GameModule extends WebserverModule {
    constructor() {
        super();

        this.resourcesDirectory = path.resolve(__dirname, "resources/web/game/")

        this.router.get("/game/", (req, res, next) => {
            res.render("game/views/index")
        })

        this.router.use("/game/styles/", express.static(this.resourcePath("styles")))
        this.router.use("/game/scripts/", express.static(this.resourcePath("scripts")))
        this.router.use("/game/assets/", express.static(this.resourcePath("assets")))
    }
}

export default GameModule;