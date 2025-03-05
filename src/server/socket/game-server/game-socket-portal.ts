import SocketPortalClient from '../socket-portal-client';
import SocketPortal from '../socket-portal';
import * as Websocket from "websocket";
import BinaryPacket from "src/networking/binary-packet";
import RoomConfig from "src/server/room/room-config";
import WebsocketConnection from "src/server/websocket-connection";
import * as url from "url";
import Server from "src/server/server";
import {WebserverSession} from "src/server/webserver/webserver-session";
import Entity from "src/utils/ecs/entity";
import serverGameRoomPrefab from "src/server/room/server-game-room-prefab";
import RoomClientComponent from "src/server/room/components/room-client-component";
import ServerEntityPrefabs from 'src/server/entity/server-entity-prefabs';
import { EntityType } from 'src/entity/entity-type';
import MapLoaderComponent from 'src/server/room/components/map-loader-component';
import WorldTilemapComponent from 'src/physics/world-tilemap-component';
import fs from 'fs'
import { MapFile } from 'src/map/map-serialization';

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

export class InvalidGameModeError extends Error {
    constructor(mode: string) {
        super("Invalid game mode: " + mode)
        this.name = "InvalidGameModeError"
    }
}

export interface GameSocketPortalClientData {
    name: string
    room: string
}

export type GameSocketPortalClient = SocketPortalClient<GameSocketPortalClientData>

export default class GameSocketPortal extends SocketPortal {
    public games = new Map<string, Entity>()
    public server: Server

    constructor(server: Server) {
        super()

        this.server = server
    }

    private getQueryFromRequest(request: Websocket.request) {
        if(typeof request.resourceURL.query === "string") {
            return url.parse(request.resourceURL.href, true).query
        } else {
            return request.resourceURL.query
        }
    }

    private getRoomFromRequest(request: Websocket.request) {
        return this.getQueryFromRequest(request).room as string
    }

    handleRequest(request: Websocket.request) {

        // Only handling /game-socket requests

        if(request.resourceURL.pathname === "/game-socket") {
            this.handleGameSocketRequest(request)
        }
    }

    handleGameSocketRequest(request: Websocket.request) {
        let roomName = this.getRoomFromRequest(request)

        if (!roomName) {
            request.reject(400, "no-room-name")
            return
        }

        let room = this.games.get(roomName)
        if (!room) {
            request.reject(200, "no-such-room")
            return
        }

        let clientComponent = room.getComponent(RoomClientComponent)

        if(clientComponent.getCurrentOnline() >= clientComponent.getMaxOnline()) {
            request.reject(200, "room-is-full")
            return
        }

        this.server.webServer.getSessionFor(request.httpRequest, (session: WebserverSession) => {
            if(!session.username) {
                request.reject(403, "not-authenticated")
                return
            }

            if(this.clientIsAlreadyInRoom(clientComponent, session.username)) {
                request.reject(200, "already-in-room")
                return
            }

            const connection = this.allowRequest(request)
            const client = this.createClient(connection, request, session)
            this.setupClient(client)
        })
    }

    private clientIsAlreadyInRoom(clientComponent: RoomClientComponent, username: string) {
        // TODO: should check if client is in any room. Maybe it should be stored in a session

        for(let client of clientComponent.portal.clients.values()) {
            if(client.data.name === username) {
                return true
            }
        }
        return false
    }

    terminate() {
        super.terminate()
    }

    configureClient(client: GameSocketPortalClient, game: Entity) {
        if(client.game) {
            client.game.getComponent(RoomClientComponent).portal.clientDisconnected(client)
        }

        game.getComponent(RoomClientComponent).portal.clientConnected(client)
        client.game = game
    }

    clientDisconnected(client: GameSocketPortalClient) {
        super.clientDisconnected(client);
        if(client.game) {
            client.game.getComponent(RoomClientComponent).portal.clientDisconnected(client)
        }
    }

    handlePacket(packet: BinaryPacket, client: GameSocketPortalClient) {
        super.handlePacket(packet, client)
    }

    clientConnected(client: GameSocketPortalClient) {
        let game = this.games.get(client.data.room)

        try {
            this.configureClient(client, game)
        } catch(e) {
            console.error("Failed to connect client", e)
            client.connection.close("Internal server error")
            return
        }
    }

    async createRoom(config: RoomConfig) {
        if(this.games.has(config.name)) {
            throw new RoomNameUsedError("There is already a room with name " + config.name)
        }

        let game = new Entity()
        serverGameRoomPrefab(game, {
            name: config.name,
            gameSocket: this,
            mode: config.mode
        })

        let json = JSON.parse(fs.readFileSync(config.map, "utf-8")) as unknown as MapFile

        let tilemap = new Entity()
        ServerEntityPrefabs.types.get(EntityType.TILEMAP)(tilemap)
        tilemap.addComponent(new MapLoaderComponent(json))
        tilemap.getComponent(MapLoaderComponent).reloadMap()
        game.appendChild(tilemap)

        game.addComponent(new WorldTilemapComponent())
        game.getComponent(WorldTilemapComponent).setMap(tilemap)

        let gameModeController = new Entity()
        if(config.mode == "CTF") {
            ServerEntityPrefabs.types.get(EntityType.CTF_GAME_MODE_CONTROLLER_ENTITY)(gameModeController)
        } else if(config.mode == "TDM") {
            ServerEntityPrefabs.types.get(EntityType.TDM_GAME_MODE_CONTROLLER_ENTITY)(gameModeController)
        } else if(config.mode == "DM") {
            ServerEntityPrefabs.types.get(EntityType.DM_GAME_MODE_CONTROLLER_ENTITY)(gameModeController)
        } else {
            throw new InvalidGameModeError(config.mode)
        }

        game.appendChild(gameModeController)

        this.games.set(config.name, game)
    }

    createClient(connection: WebsocketConnection, request: Websocket.request, session: WebserverSession): GameSocketPortalClient {
        let roomName = this.getRoomFromRequest(request)

        return new SocketPortalClient<GameSocketPortalClientData>({
            connection: connection,
            data: {
                name: session.username,
                room: roomName
            }
        })
    }
}
