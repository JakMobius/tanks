import WebserverModule from '../webserver-module';
import * as path from 'path';
import {redirectToSlash} from "../redirest-to-slash";
import WebServer from "src/server/webserver/webserver";
import {WebserverSession} from "src/server/webserver/webserver-session";
import {UserDataRaw} from "src/client/utils/user-data-raw";
import LoginAjaxHandler from "src/server/webserver/game/ajax/login-handler";
import RegisterAjaxHandler from "src/server/webserver/game/ajax/register-handler";
import ProfileImageAjaxHandler from "src/server/webserver/game/ajax/profile-image";
import MapListAjaxHandler from "src/server/webserver/game/ajax/map-list";
import RoomCreateAjaxHandler from "src/server/webserver/game/ajax/room-create";
import RoomListAjaxHandler from "src/server/webserver/game/ajax/room-list";

export default class GameModule extends WebserverModule {

    private userDataFromSession(session: WebserverSession) {
        return JSON.stringify({
            username: session.username
        } as UserDataRaw)
    }

    setServer(server: WebServer) {
        super.setServer(server);

        this.resourcesDirectory = this.webServer.server.getResourcePath("web")

        this.router.get("/", (req, res, next) => {
            if (redirectToSlash(req, res)) return;
            let session = req.session as WebserverSession
            res.render("views/index", { userData: this.userDataFromSession(session) })
        })

        this.addAjaxHandler(new LoginAjaxHandler())
        this.addAjaxHandler(new RegisterAjaxHandler())
        this.addAjaxHandler(new ProfileImageAjaxHandler())
        this.addAjaxHandler(new MapListAjaxHandler())
        this.addAjaxHandler(new RoomCreateAjaxHandler())
        this.addAjaxHandler(new RoomListAjaxHandler())
    }
}