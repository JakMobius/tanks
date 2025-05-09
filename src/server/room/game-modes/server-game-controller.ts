import ServerGameStateController from "./server-game-state-controller";
import Entity from "src/utils/ecs/entity";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import {TransmitterSet} from "src/entity/components/network/transmitting/transmitter-set";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import {GameSocketPortalClient} from "src/server/socket/game-server/game-socket-portal";
import PlayerPrefab from "src/entity/types/player/server-prefab";
import EventEmitter from "src/utils/event-emitter";
import PlayerWorldComponent from "src/entity/types/player/server-side/player-world-component";
import ServerDatabase from "src/server/db/server-database";
import GameModeEventTransmitter from "src/entity/components/game-mode/game-mode-event-transmitter";
import PlayerNickComponent from "src/entity/types/player/server-side/player-nick-component";
import PlayerConnectionManagerComponent from "src/entity/types/player/server-side/player-connection-manager-component";
import PlayerDataComponent from "src/entity/types/player/server-side/player-data-component";
import EntityDataTransmitComponent from "src/entity/components/network/transmitting/entity-data-transmit-component";


export default abstract class ServerGameController extends EventHandlerComponent {

    worldEventHandler = new BasicEventHandlerSet()
    world: Entity
    players = new Set<Entity>()
    activeGameState: ServerGameStateController
    db: ServerDatabase

    protected constructor() {
        super()

        this.eventHandler.on("transmitter-set-added", (transmitterSet: TransmitterSet) => {
            transmitterSet.initializeTransmitter(GameModeEventTransmitter, this)
        })

        this.worldEventHandler.on("client-connect", (client) => this.onClientConnected(client), EventEmitter.PRIORITY_MONITOR)

        this.eventHandler.on("set-db", (db) => this.db = db)
        this.eventHandler.on("set-world", (world) => this.setWorld(world))

        this.worldEventHandler.on("player-connect", (player) => this.players.add(player))
        this.worldEventHandler.on("player-disconnect", (player) => this.players.delete(player))
    }

    setWorld(world: Entity) {
        this.world = world
        this.worldEventHandler.setTarget(world)
    }

    triggerStateBroadcast(player?: Entity) {
        let receivingEnd = player?.getComponent(PlayerConnectionManagerComponent)?.end
        let transmitComponent = this.entity.getComponent(EntityDataTransmitComponent)
        if(!receivingEnd) {
            for(let set of transmitComponent.transmitterSets.values()) {
                set.getTransmitter(GameModeEventTransmitter).updateState()
            }
        } else {
            let transmitterSet = transmitComponent.transmitterSetFor(receivingEnd)
            transmitterSet.getTransmitter(GameModeEventTransmitter).updateState()
        }
    }

    sendEvent(event: any, player?: Entity) {
        let receivingEnd = player?.getComponent(PlayerConnectionManagerComponent)?.end
        let transmitComponent = this.entity.getComponent(EntityDataTransmitComponent)
        if(!receivingEnd) {
            for(let set of transmitComponent.transmitterSets.values()) {
                set.getTransmitter(GameModeEventTransmitter).sendEvent(event)
            }
        } else {
            let transmitterSet = transmitComponent.transmitterSetFor(receivingEnd)
            transmitterSet.getTransmitter(GameModeEventTransmitter).sendEvent(event)
        }
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
        if(!this.world || !this.db) return

        let player = new Entity()

        PlayerPrefab.prefab(player)
        player.getComponent(PlayerConnectionManagerComponent).setClient(client)
        player.getComponent(PlayerDataComponent).db = this.db
        player.getComponent(PlayerNickComponent).nick = client.data.name
        player.getComponent(PlayerWorldComponent).connectToWorld(this.world)
    }
}