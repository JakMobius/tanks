import AjaxHandler, {AjaxFields, AjaxFieldType} from "src/server/webserver/ajax/ajax-handler";
import express from "express";
import {nickIsValid} from "src/data-checkers/nick-checker";
import {passwordIsValid} from "src/data-checkers/password-checker";
import {WebserverSession} from "src/server/webserver/webserver-session";
import GameModule from "src/server/webserver/game/game-module";

interface RegisterAjaxFields extends AjaxFields {
    login: string
    password: string
}

export default class RegisterAjaxHandler extends AjaxHandler<GameModule> {
    static url = '/ajax/register/'
    static method = 'POST'
    static schema = [
        { name: 'login',    type: AjaxFieldType.string },
        { name: 'password', type: AjaxFieldType.string }
    ]

    handle(req: express.Request, res: express.Response, fields: RegisterAjaxFields, next: express.NextFunction) {
        if((req.session as WebserverSession).username) {
            res.status(200).send({ result: "already-authorised" })
            return;
        }

        if(!this.module.webServer.server.config.webServer.enableRegistration) {
            res.status(200).send({ result: "registration-disabled" })
            return;
        }

        if(!nickIsValid(fields.login)) {
            res.status(200).send({ result: "check-login" })
            return
        }

        if(!passwordIsValid(fields.password)) {
            res.status(200).send({ result: "check-password" })
            return
        }

        this.module.webServer.server.db.createUser(fields.login, fields.password).then((result) => {
            if(result) {
                res.status(200).send({ result: "ok" })
            } else {
                res.status(200).send({ result: "login-used" })
            }
        }).catch(next)
    }
}