import WebserverModule from '../webserver-module';
import path from 'path';
import {redirectToSlash} from "../redirest-to-slash";
import {UserDataRaw} from "../../../client/user-data-raw";
import LoginAjaxHandler from "./ajax/login-handler";
import RegisterAjaxHandler from "./ajax/register-handler";
import {WebserverSession} from "../webserver-session";
import ProfileImageAjaxHandler from "./ajax/profile-image";
import MapListAjaxHandler from "./ajax/map-list";
import RoomCreateAjaxHandler from "./ajax/room-create";

export default class HubModule extends WebserverModule {

    private userDataFromSession(session: WebserverSession) {
        return JSON.stringify({
            username: session.username
        } as UserDataRaw)
    }

    constructor() {
        super();

        this.resourcesDirectory = path.resolve(__dirname, "resources/web")
        
        this.router.get("/hub/", (req, res, next) => {
            if(redirectToSlash(req, res)) return;
            let session = req.session as WebserverSession

            res.render("hub/views/index", { userData: this.userDataFromSession(session) })
        })

        this.router.get("/tutorial/", (req, res, next) => {
            if(redirectToSlash(req, res)) return;
            let session = req.session as WebserverSession

            res.render("hub/views/tutorial", { userData: this.userDataFromSession(session) })
        })

        this.addAjaxHandler(new LoginAjaxHandler())
        this.addAjaxHandler(new RegisterAjaxHandler())
        this.addAjaxHandler(new ProfileImageAjaxHandler())
        this.addAjaxHandler(new MapListAjaxHandler())
        this.addAjaxHandler(new RoomCreateAjaxHandler())
    }
}