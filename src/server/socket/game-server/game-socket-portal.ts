import SocketPortalClient from '../socket-portal-client';
import SocketPortal from '../socket-portal';
import pako from 'pako';
import Room from "../../room/room";
import * as Websocket from "websocket";
import BinaryPacket from "../../../networking/binary-packet";
import * as fs from "fs"
import RoomConfig from "../../room/room-config";
import WebsocketConnection from "../../websocket-connection";
import MapSerialization, {MalformedMapFileError} from "../../../map/map-serialization";
import ServerGame from "../../room/server-game";

import 'src/effects/model-loader'
import 'src/map/block-state/type-loader'
import 'src/server/entity/type-loader'
import 'src/server/entity/type-loader'
import 'src/entity/model-loader'
import GameMap from "../../../map/game-map";
import {checkRoomName} from "../../../data-checkers/room-name-checker";

export class NoSuchMapError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = "NoSuchMapError";
    }
}

export class RoomNameUsedError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = "RoomNameUsedError";
    }
}

export default class GameSocketPortal extends SocketPortal {
    public games = new Map<string, Room>()

    constructor() {
        super()
    }

    handleRequest(request: Websocket.request) {

        // Only handling /game-socket requests

        if(request.resourceURL.path === "/game-socket") {
            super.handleRequest(request);
        }
    }

    terminate() {
        super.terminate()
    }

    configureClient(client: SocketPortalClient, game: Room) {
        if(client.game) {
            this.logger.log("Клиент " + client.id + " отключен от игры " + client.game.name)
            client.game.portal.clientDisconnected(client)
        }

        this.logger.log("Клиент " + client.id + " подключен к игре " + game.name)

        game.portal.clientConnected(client)
        client.game = game
    }

    clientDisconnected(client: SocketPortalClient) {
        super.clientDisconnected(client);
        if(client.game) {
            this.logger.log("Клиент " + client.id + " отключен от игры " + client.game.name)
            client.game.portal.clientDisconnected(client)
        }
    }

    handlePacket(packet: BinaryPacket, client: SocketPortalClient) {
        super.handlePacket(packet, client)
    }

    getFreeGame() {
        let game, online = -1

        for(let eachGame of this.games.values()) {
            const eachOnline = eachGame.portal.clients.size

            if(eachOnline < eachGame.maxOnline) {
                if(eachOnline > online) {
                    game = eachGame
                    online = eachOnline
                }
            }
        }

        return game
    }

    clientConnected(client: SocketPortalClient) {
        let connection = client.connection

        // if(this.banned.indexOf(connection.remoteAddress) !== -1) {
        //     connection.close("Администратор внёс Ваш ip в бан-лист")
        //     return
        // }

        if(this.games.size === 0) {
            connection.close("Нет запущенных игр, попробуйте позже")
            return
        }

        let game = this.getFreeGame();

        if(!game) {
            connection.close("Сервер переполнен, попробуйте позже")
            return
        }

        this.configureClient(client, game)
    }

    async createRoom(config: RoomConfig) {
        if(this.games.has(config.name)) {
            throw new RoomNameUsedError("There is already a room with name " + config.name)
        }

        let file: Buffer
        try {
            file = await fs.promises.readFile(config.map)
        } catch(e) {
            throw new NoSuchMapError("No such map: " + config.map)
        }

        let map: GameMap
        try {
            map = MapSerialization.fromBuffer(pako.inflate(file))
        } catch(e) {
            throw new MalformedMapFileError("Could not read map file " + config.map + ": " + e.message)
        }

        const game = new ServerGame({
            name: config.name,
            map: map
        })

        this.games.set(config.name, game)
    }

    createClient(connection: WebsocketConnection): SocketPortalClient {
        return new SocketPortalClient({
            connection: connection,
            data: {}
        })
    }
}
