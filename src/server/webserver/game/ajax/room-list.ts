import express from "express";
import AjaxHandler, {AjaxFields} from "src/server/webserver/ajax/ajax-handler";
import RoomClientComponent from "src/server/room/components/room-client-component";

export default class RoomListAjaxHandler extends AjaxHandler {
    static url = '/ajax/room-list/'
    static method = 'POST'
    static requiresAuthentication = true

    handle(req: express.Request, res: express.Response, fields: AjaxFields, next: express.NextFunction) {
        let games = this.module.webServer.server.gameSocket.games

        let json = []

        for(let game of games.values()) {

            let clientComponent = game.getComponent(RoomClientComponent)

            json.push({
                name: clientComponent.name,
                players: clientComponent.getCurrentOnline(),
                maxPlayers: clientComponent.getMaxOnline(),
                mode: clientComponent.mode,
                map: "Какая-то карта",
            })
        }

        res.status(200).send({ result: "ok", rooms: json })
    }
}