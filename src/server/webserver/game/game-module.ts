
import WebserverModule from '../webserver-module';
import * as path from 'path';
import * as express from 'express';

class GameModule extends WebserverModule {
    constructor() {
        super();

        this.resourcesDirectory = path.resolve(__dirname, "../../html-pages/game-page")

        this.router.get("/game/", (req, res, next) => {
            res.render("game-page/page/index")
        })

        this.router.use("/game/styles/", express.static(this.resourcePath("styles")))
        this.router.use("/game/scripts/", express.static(this.resourcePath("scripts")))
    }
}

export default GameModule;