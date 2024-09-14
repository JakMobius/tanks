import AjaxHandler, {AjaxFields, AjaxFieldType} from "src/server/webserver/ajax/ajax-handler";
import express from "express";
import {WebserverSession} from "src/server/webserver/webserver-session";
import GameModule from "src/server/webserver/game/game-module";

interface LoginAjaxFields extends AjaxFields {
    login: string
    password: string
}

export default class LoginAjaxHandler extends AjaxHandler<GameModule> {
    static url = '/ajax/login/'
    static method = 'POST'
    static schema = [
        { name: 'login',    type: AjaxFieldType.string },
        { name: 'password', type: AjaxFieldType.string }
    ]

    handle(req: express.Request, res: express.Response, fields: LoginAjaxFields, next: express.NextFunction) {
        if((req.session as WebserverSession).username) {
            res.status(200).send({ result: "already-authorised" })
            return;
        }

        this.module.webServer.server.db.authoriseUser(fields.login, fields.password).then((result) => {
            if(!result) {
                res.status(200).send({ result: "invalid-credentials" })
                return
            }

            this.authorizeUser(req, fields.login);
            res.status(200).send({ result: "ok" })

        }).catch(next)
    }

    private authorizeUser(req: express.Request, login: string) {
        (req.session as WebserverSession).username = login
    }
}