import ClientGameWorld from "../client-game-world";
import Game from "../../server/room/game";
import GameMap from "../../map/game-map";
import ClientWorldBridge from "../game/client-world-bridge";
import AdapterLoop from "../../utils/loop/adapter-loop";
import ConnectionClient from "../../networking/connection-client";
import SocketPortalClient from "../../server/socket/socket-portal-client";
import Connection from "../../networking/connection";
import LocalConnection from "../../networking/local-connection";
import PlayerVisibilityManager from "../../server/player-visibility-manager";

export class EmbeddedServerGameConfig {
    map: GameMap
}

export default class EmbeddedServerGame {
    clientConnection: ConnectionClient<Connection>
    clientWorld: ClientGameWorld
    serverGame: Game

    serverLoop = new AdapterLoop()

    constructor(config: EmbeddedServerGameConfig) {
        const map = config.map

        this.serverGame = new Game({
            map: map,
            name: "Embedded Server Game",
            loop: this.serverLoop
        })

        this.serverLoop.setInterval(this.serverGame.spt)
        this.serverLoop.start()

        this.clientWorld = new ClientGameWorld({
            map: map
        })

        const clientConnection = new LocalConnection()
        this.clientConnection = new ConnectionClient(clientConnection)

        ClientWorldBridge.buildBridge(this.clientConnection, this.clientWorld)
    }

    connectClientToServer() {

        const serverConnection = new LocalConnection()
        Connection.pipeReversed(this.clientConnection.connection, serverConnection)
        const visibilityManager = new PlayerVisibilityManager()

        let client = new SocketPortalClient({
            connection: serverConnection,
            data: {
                listeningForRooms: false,
                player: null,
                visibilityManager: visibilityManager
            }
        })

        visibilityManager.client = client

        this.serverGame.portal.clientConnected(client)
    }

    tick(dt: number) {
        this.clientWorld.tick(dt)
        this.serverLoop.timePassed(dt)
    }
}