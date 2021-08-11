import ClientGameWorld from "../client-game-world";
import Game from "../../server/room/game";
import GameMap from "../../map/gamemap";
import ClientWorldBridge from "../game/client-world-bridge";
import AdapterLoop from "../../utils/loop/adapter-loop";
import ConnectionClient from "../../networking/connection-client";
import SocketPortalClient from "../../server/socket/socket-portal-client";
import Connection from "../../networking/connection";
import LocalConnection from "../../networking/local-connection";

export class EmbeddedServerGameConfig {
    map: GameMap
}

export default class EmbeddedServerGame {
    client: ConnectionClient<Connection>
    server: ConnectionClient<Connection>

    clientWorld: ClientGameWorld
    serverGame: Game

    serverLoop = new AdapterLoop()

    // TODO: there is way too much stuff happening in the constructor

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
        this.client = new ConnectionClient(clientConnection)
        ClientWorldBridge.buildBridge(this.client, this.clientWorld)
    }

    connectClientToServer() {

        const serverConnection = new LocalConnection()
        Connection.pipeReversed(this.client.connection, serverConnection)

        this.serverGame.portal.clientConnected(new SocketPortalClient({
            connection: serverConnection,
            data: {
                listeningForRooms: false,
                player: null
            }
        }))
    }

    tick(dt: number) {
        this.clientWorld.tick(dt)
        this.serverLoop.timePassed(dt)
    }
}