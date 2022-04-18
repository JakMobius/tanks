import WebserverModule from '../webserver-module';
import * as path from 'path';
import {redirectToSlash} from "../redirest-to-slash";

class GameModule extends WebserverModule {
    constructor() {
        super();

        this.resourcesDirectory = path.resolve(__dirname, "resources/web/game/")

        this.router.get("/game/", (req, res, next) => {
            if(redirectToSlash(req, res)) return;
            res.render("game/views/index")
        })
    }
}

export default GameModule;