import ServerGameStateController from "./server-game-state-controller";
import Entity from "src/utils/ecs/entity";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import {TransmitterSet} from "src/entity/components/network/transmitting/transmitter-set";
import GameModeEventTransmitter from "src/entity/components/network/game-mode/game-mode-event-transmitter";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import GameSocketPortal, {GameSocketPortalClient} from "src/server/socket/game-server/game-socket-portal";
import {serverPlayerEntityPrefab} from "src/entity/types/player/server-side/server-prefab";
import EventEmitter from "src/utils/event-emitter";
import PlayerWorldComponent from "src/entity/types/player/server-side/player-world-component";


export default abstract class ServerGameController extends EventHandlerComponent {

    worldEventHandler = new BasicEventHandlerSet()
    world: Entity
    private socket: GameSocketPortal
    activeGameState: ServerGameStateController

    private needsBroadcast = false

    protected constructor() {
        super()

        this.eventHandler.on("transmitter-set-added", (transmitterSet: TransmitterSet) => {
            transmitterSet.initializeTransmitter(GameModeEventTransmitter, this)
        })
        
        this.eventHandler.on("attached-to-parent", () => this.updateWorld())
        this.eventHandler.on("detached-from-parent", () => this.updateWorld())

        this.worldEventHandler.on("tick", () => {
            if (this.needsBroadcast) {
                this.needsBroadcast = false
                this.entity.emit("state-broadcast")
            }
        })

        this.worldEventHandler.on("client-connect", (client) => this.onClientConnected(client), EventEmitter.PRIORITY_MONITOR)
    }

    updateWorld() {
        this.setWorld(this.entity.parent)
    }

    setWorld(world: Entity) {
        this.world = world
        this.worldEventHandler.setTarget(world)
    }

    triggerStateBroadcast() {
        this.needsBroadcast = true
    }

    activateGameState(gameState: ServerGameStateController) {
        if (this.activeGameState) {
            this.activeGameState.deactivate()
        }

        this.activeGameState = gameState

        if (this.activeGameState) {
            this.activeGameState.activate()
        }

        this.triggerStateBroadcast()
    }

    protected onClientConnected(client: GameSocketPortalClient) {
        if(!this.socket || !this.world) return

        let player = new Entity()

        serverPlayerEntityPrefab(player, {
            client: client,
            db: this.socket.server.db,
            nick: client.data.name
        })

        player.getComponent(PlayerWorldComponent).connectToWorld(this.world)
    }
}