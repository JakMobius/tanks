import express from "express";
import AjaxHandler, {AjaxFields} from "../../ajax/ajax-handler";
import RoomClientComponent from "../../../room/components/room-client-component";

export default class RoomListAjaxHandler extends AjaxHandler {
    static url = '/hub/ajax/room-list/'
    static method = 'GET'
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
                map: "Какая-то карта",
                mode: "TDM",
            })
        }

        res.status(200).send({ result: "ok", rooms: json })
    }
}