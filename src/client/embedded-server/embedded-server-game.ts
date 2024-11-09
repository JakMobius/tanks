import GameMap from "src/map/game-map";
import AdapterLoop from "src/utils/loop/adapter-loop";
import ConnectionClient from "src/networking/connection-client";
import Connection from "src/networking/connection";
import LocalConnection from "src/networking/local-connection";
import SocketPortalClient from "src/server/socket/socket-portal-client";
import serverGameRoomPrefab from "src/server/room/server-game-room-prefab";
import Entity from "src/utils/ecs/entity";
import RoomClientComponent from "src/server/room/components/room-client-component";
import {clientGameWorldEntityPrefab} from "src/client/entity/client-game-world-entity-prefab";

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
            tps: 20
        })

        this.serverLoop.setInterval(1 / 20)
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
        this.clientWorld.emit("tick", dt)
        this.serverLoop.timePassed(dt)
    }
}