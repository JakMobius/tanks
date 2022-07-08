import SocketPortalClient from '../socket-portal-client';
import SocketPortal from '../socket-portal';
import RoomListRequestPacket from '../../../networking/packets/game-packets/room-list-request-packet';
import RoomListPacket from '../../../networking/packets/game-packets/room-list-packet';
import PlayerRoomRequestPacket from '../../../networking/packets/game-packets/player-room-request-packet';
import PlayerRoomChangePacket from '../../../networking/packets/game-packets/player-room-change-packet';
import pako from 'pako';
import Room from "../../room/room";
import * as Websocket from "websocket";
import BinaryPacket from "../../../networking/binary-packet";
import * as fs from "fs"
import RoomConfig from "../../room/room-config";
import GameMap from "../../../map/game-map";
import Game from "../../room/game";
import WebsocketConnection from "../../websocket-connection";
import ReadBuffer from "../../../serialization/binary/read-buffer";
import PlayerVisibilityManager from "../../player-visibility-manager";
import Player from "../../../player";
import MapSerialization from "../../../map/map-serialization";

export interface GameSocketPortalClientData {
    player: Player | null
    visibilityManager: PlayerVisibilityManager
}

export type GameSocketPortalClient = SocketPortalClient<GameSocketPortalClientData>

export default class GameSocketPortal extends SocketPortal<GameSocketPortalClientData> {
	public roomsInterval: NodeJS.Timeout;
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

    configureClient(client: GameSocketPortalClient, game: Room) {
        if(client.game) {
            this.logger.log("Клиент " + client.id + " отключен от игры " + client.game.name)
            client.game.portal.clientDisconnected(client)
        }

        this.logger.log("Клиент " + client.id + " подключен к игре " + game.name)

        game.portal.clientConnected(client)
        client.game = game
    }

    clientDisconnected(client: GameSocketPortalClient) {
        super.clientDisconnected(client);
        if(client.game) {
            this.logger.log("Клиент " + client.id + " отключен от игры " + client.game.name)
            client.game.portal.clientDisconnected(client)
        }
    }

    handlePacket(packet: BinaryPacket, client: GameSocketPortalClient) {
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

    clientConnected(client: GameSocketPortalClient) {
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
        try {
            const gzip = await fs.promises.readFile(config.map)
            const map = MapSerialization.fromBuffer(gzip)

            const game = new Game({
                name: config.name,
                map: map
            })

            this.games.set(config.name, game)

        } catch(e) {
            console.error("Failed to load map: ", e)
            return;
        }
    }

    createClient(connection: WebsocketConnection): GameSocketPortalClient {

        let visibilityManager = new PlayerVisibilityManager()

        let client = new SocketPortalClient<GameSocketPortalClientData>({
            connection: connection,
            data: {
                player: null,
                visibilityManager: visibilityManager
            }
        })

        visibilityManager.client = client

        return client
    }
}
