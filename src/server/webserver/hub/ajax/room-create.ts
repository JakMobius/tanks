import AjaxHandler, {AjaxFields, AjaxFieldType} from "../../ajax/ajax-handler";
import express from "express";
import RoomConfig from "../../../room/room-config";
import path from "path";
import {NoSuchMapError, RoomNameUsedError} from "../../../socket/game-server/game-socket-portal";
import {MalformedMapFileError} from "../../../../map/map-serialization";
import {checkRoomName} from "../../../../data-checkers/room-name-checker";

export default class RoomCreateAjaxHandler extends AjaxHandler {
    static url = '/hub/ajax/room-create/'
    static method = 'POST'
    static schema = [
        { name: 'name', type: AjaxFieldType.string },
        { name: 'map', type: AjaxFieldType.string },
        { name: 'mode', type: AjaxFieldType.string }
    ]
    static requiresAuthentication = true

    handle(req: express.Request, res: express.Response, fields: AjaxFields, next: express.NextFunction) {
        let map = fields.map as string
        let mode = fields.mode as string
        let name = fields.name as string

        if(path.isAbsolute(map)) {
            res.status(200).send({ result: "invalid-map" })
            return;
        }

        if(checkRoomName(name).length) {
            res.status(200).send({ result: "invalid-room-name" })
            return;
        }

        let mapsDirectory = this.module.webServer.server.config.general.mapsDirectory

        let roomConfig = new RoomConfig()

        roomConfig.name = name
        roomConfig.map = path.join(mapsDirectory, map)

        let server = this.module.webServer.server
        server.gameSocket.createRoom(roomConfig).then(() => {
            res.status(200).send({
                result: "ok",
                url: "/game/?room=" + name
            })
            console.log("Room " + name + " was successfully created!")
        }).catch(e => {
            if(e instanceof NoSuchMapError || e instanceof MalformedMapFileError) {
                res.status(200).send({ result: "invalid-map" })
            } else if(e instanceof RoomNameUsedError) {
                res.status(200).send({ result: "room-name-used" })
            } else throw e;
        })
    }
}