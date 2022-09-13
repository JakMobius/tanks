import GameMap from "../../map/game-map";
import AdapterLoop from "../../utils/loop/adapter-loop";
import ConnectionClient from "../../networking/connection-client";
import Connection from "../../networking/connection";
import LocalConnection from "../../networking/local-connection";
import SocketPortalClient from "../../server/socket/socket-portal-client";
import serverGameRoomPrefab from "../../server/room/server-game-room-prefab";
import Entity from "../../utils/ecs/entity";
import RoomClientComponent from "../../server/room/components/room-client-component";
import {clientGameWorldEntityPrefab} from "../client-game-world-entity-prefab";

export class EmbeddedServerGameConfig {
    map: GameMap
}

export default class EmbeddedServerGame {
    clientConnection: ConnectionClient<Connection>
    clientWorld: Entity
    serverGame: Entity

    serverLoop = new AdapterLoop()

    constructor(config: EmbeddedServerGameConfig) {
        const map = config.map

        this.serverGame = new Entity()
        serverGameRoomPrefab(this.serverGame, {
            map: map,
            name: "Embedded Server Game",
            loop: this.serverLoop,
        })

        this.serverLoop.setInterval(50)
        this.serverLoop.start()

        this.clientWorld = new Entity()
        clientGameWorldEntityPrefab(this.clientWorld, {
            map: map
        })

        const clientConnection = new LocalConnection()
        this.clientConnection = new ConnectionClient(clientConnection)
    }

    connectClientToServer() {

        const serverConnection = new LocalConnection()
        Connection.pipeReversed(this.clientConnection.connection, serverConnection)

        let client = new SocketPortalClient({
            connection: serverConnection,
            data: {}
        })

        let clientComponent = this.serverGame.getComponent(RoomClientComponent)
        clientComponent.portal.clientConnected(client)
    }

    tick(dt: number) {
        this.clientWorld.propagateEvent("tick", dt)
        this.serverLoop.timePassed(dt)
    }
}