import AjaxHandler, {AjaxFields, AjaxFieldType} from "src/server/webserver/ajax/ajax-handler";
import express from "express";
import GameModule from "src/server/webserver/game/game-module";

interface LoginAjaxFields extends AjaxFields {
    login: string
    password: string
}

export default class ProfileImageAjaxHandler extends AjaxHandler<GameModule> {
    static url = '/ajax/profile-image/'
    static method = 'GET'
    static schema = [
        { name: 'username', type: AjaxFieldType.string },
    ]

    handle(req: express.Request, res: express.Response, fields: LoginAjaxFields, next: express.NextFunction) {
        res.sendFile(this.module.resourcePath('static/hub/profile.png'))
    }
}