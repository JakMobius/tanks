import AjaxHandler, {AjaxFields, AjaxFieldType} from "../../ajax/ajax-handler";
import express from "express";
import HubModule from "../hub-module";
import MongoDatabase from "../../../db/mongo/mongo-database";
import {WebserverSession} from "../../webserver-session";

interface LoginAjaxFields extends AjaxFields {
    login: string
    password: string
}

export default class LoginAjaxHandler extends AjaxHandler<HubModule> {
    static url = '/hub/ajax/login/'
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