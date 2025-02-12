import AjaxHandler from "src/server/webserver/ajax/ajax-handler";
import express from "express";
import {WebserverSession} from "src/server/webserver/webserver-session";
import GameModule from "src/server/webserver/game/game-module";

export default class LogoutAjaxHandler extends AjaxHandler<GameModule> {
    static url = '/ajax/logout/'
    static method = 'POST'
    static requiresAuthentication = true

    handle(req: express.Request, res: express.Response) {
        (req.session as WebserverSession).username = undefined
        res.status(200).send({ result: "ok" })
    }
}