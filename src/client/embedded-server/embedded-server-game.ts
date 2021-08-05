import ClientGameWorld from "../client-game-world";
import Game from "../../server/room/game";
import GameMap from "../../map/gamemap";
import EmbeddedServerClient from "./embedded-server-client";
import ClientWorldBridge from "../game/client-world-bridge";
import AdapterLoop from "../../utils/loop/adapter-loop";

export class EmbeddedServerGameConfig {
    map: GameMap
}

export default class EmbeddedServerGame {
    embeddedServerClient: EmbeddedServerClient
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

        this.embeddedServerClient = new EmbeddedServerClient(this.serverGame)
        ClientWorldBridge.buildBridge(this.embeddedServerClient, this.clientWorld)
    }

    connectClient() {
        this.embeddedServerClient.connectToServer()
    }

    tick(dt: number) {
        this.clientWorld.tick(dt)
        this.serverLoop.timePassed(dt)
    }
}