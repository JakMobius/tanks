import AjaxHandler, {AjaxFields, AjaxFieldType} from "../../ajax/ajax-handler";
import express from "express";
import HubModule from "../hub-module";

interface LoginAjaxFields extends AjaxFields {
    login: string
    password: string
}

export default class ProfileImageAjaxHandler extends AjaxHandler<HubModule> {
    static url = '/hub/ajax/profile-image/'
    static method = 'GET'
    static schema = [
        { name: 'username', type: AjaxFieldType.string },
    ]

    handle(req: express.Request, res: express.Response, fields: LoginAjaxFields, next: express.NextFunction) {
        res.sendFile(this.module.resourcePath('hub/assets/no-profile-image.png'))
    }
}