import express from "express";
import WebserverModule from "../webserver-module";
import {WebserverSession} from "../webserver-session";

export enum AjaxFieldType {
    string, number, json, boolean
}

export interface AjaxField {
    name: string
    type: AjaxFieldType
}

export interface AjaxFields {
    [key: string]: string | boolean | number | Object
}

export type AjaxSchema = AjaxField[]

export default abstract class AjaxHandler<T extends WebserverModule = WebserverModule> {
    static url: string
    static method: string
    static schema: AjaxSchema
    static requiresAuthentication = false
    module: T

    handle(req: express.Request, res: express.Response, fields: AjaxFields, next: express.NextFunction) {

    }

    setModule(module: T) {
        this.module = module
    }

    onRequest(req: express.Request, res: express.Response, next: express.NextFunction) {
        let ctor = (this.constructor as typeof AjaxHandler)
        if(req.method != ctor.method) {
            res.status(405).send({
                error: 'unsupported method'
            })
            return
        }

        // Check for allowed origins
        if(this.module.webServer.checkAllowedOrigin(req, res) === false) return;

        let schema = ctor.schema
        let requestFields: any = {}

        // Use Object.create(null) here to avoid prototype pollution
        let fields: AjaxFields = Object.create(null)

        if(req.method == 'GET') requestFields = req.query
        else if(req.method == 'POST') requestFields = req.body

        if(schema) {
            for (let field of schema) {
                let fieldValue = requestFields[field.name]
                if (fieldValue === undefined) {
                    res.status(400).send({
                        error: 'missing-field',
                        field: field.name
                    })
                    return;
                }
                let type = field.type

                switch (type) {
                    case AjaxFieldType.boolean:
                        fieldValue = this.convertBoolean(fieldValue)
                        fields[field.name] = fieldValue
                        break
                    case AjaxFieldType.json:
                        fieldValue = this.convertJson(fieldValue)
                        fields[field.name] = fieldValue
                        break
                    case AjaxFieldType.number:
                        fieldValue = this.convertNumber(fieldValue)
                        fields[field.name] = fieldValue
                        break
                    case AjaxFieldType.string:
                        fieldValue = this.convertString(fieldValue)
                        fields[field.name] = fieldValue
                        break
                }

                if (fieldValue === null) {
                    res.status(400).send({
                        'error': 'malformed-input-data',
                        'message': 'value of "' + field.name + '" expected to be ' + AjaxFieldType[type]
                    })
                    return
                }
            }
        }

        if(ctor.requiresAuthentication && !(req.session as WebserverSession).username) {
            res.status(403).send({ result: "not-authenticated" })
            return;
        }

        this.handle(req, res, fields, next)
    }

    private convertBoolean(fieldValue: any): boolean {
        if(typeof fieldValue == 'boolean') return fieldValue;
        if(typeof fieldValue == 'number') {
            if(fieldValue === 1) return true;
            if(fieldValue === 0) return false;
            return null;
        }
        if(typeof fieldValue == 'string') {
            fieldValue = fieldValue.toLowerCase()
            if(fieldValue === 'true' || fieldValue === '1' || fieldValue === 'yes') return true;
            if(fieldValue === 'false' || fieldValue === '0' || fieldValue === 'no') return false;
            return null;
        }
        return null;
    }

    private convertJson(fieldValue: any): any {
        try {
            return JSON.parse(fieldValue)
        } catch(e) {}
        return null
    }

    private convertNumber(fieldValue: any): number {
        if(typeof fieldValue == 'number') return fieldValue;
        if(typeof fieldValue == 'string') {
            let result = parseFloat(fieldValue)
            if(!isNaN(result)) return result
        }
        return null
    }

    private convertString(fieldValue: any): string {
        if(typeof fieldValue == 'string') return fieldValue
        if(typeof fieldValue == 'number' || fieldValue == 'boolean') return String(fieldValue)
        return null;
    }
}