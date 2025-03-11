import Entity from "src/utils/ecs/entity";
import EventEmitter from "src/utils/event-emitter";
import PlayerRespawnEvent from "src/events/player-respawn-event";
import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import PlayerPreferredTankComponent from "src/entity/types/player/server-side/player-preferred-tank-component";
import PlayerConnectionManagerComponent from "src/entity/types/player/server-side/player-connection-manager-component";
import {UserTankChangeOnRespawnMessageTransmitter} from "src/entity/components/network/event/user-message-transmitters";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import PlayerTankComponent from "src/entity/types/player/server-side/player-tank-component";
import PlayerRespawnActionComponent from "src/entity/types/player/server-side/player-respawn-action-component";
import TransformComponent from "src/entity/components/transform/transform-component";
import { EntityType } from "src/entity/entity-prefabs";

export default class WorldRespawnComponent extends EventHandlerComponent {

    constructor() {
        super()
        this.eventHandler.on("player-preferred-tank-set", (player) => this.onPlayerSelectTank(player), EventEmitter.PRIORITY_MONITOR)
        this.eventHandler.on("player-respawn", (player, event) => this.onPlayerRespawn(player, event), EventEmitter.PRIORITY_MONITOR)
    }

    onPlayerSelectTank(player: Entity) {
        let tank = player.getComponent(PlayerTankComponent).tank

        if (!tank) {
            player.getComponent(PlayerRespawnActionComponent).performRespawnAction()
        } else {
            let preferredTankComponent = player.getComponent(PlayerPreferredTankComponent)
            let connectionManager = player.getComponent(PlayerConnectionManagerComponent)
            let transmitterSet = connectionManager.getWorldTransmitterSet()
            let transmitter = transmitterSet.getTransmitter(UserTankChangeOnRespawnMessageTransmitter)
            transmitter.sendTankChangeOnRespawnMessage(preferredTankComponent.preferredTank)
        }
    }

    onPlayerRespawn(player: Entity, event: PlayerRespawnEvent) {
        if (event.cancelled) return

        const preferredTankComponent = event.player.getComponent(PlayerPreferredTankComponent)
        if (!preferredTankComponent) return

        const preferredTank = preferredTankComponent.preferredTank
        if (!preferredTank) return

        let prefab = ServerEntityPrefabs.getById(preferredTank)
        if (!prefab || prefab.metadata.type !== EntityType.tank) return

        const playerTankComponent = event.player.getComponent(PlayerTankComponent)

        if (playerTankComponent.tank) {
            let tank = playerTankComponent.tank
            playerTankComponent.setTank(null)
            tank.removeFromParent()
        }

        const tank = new Entity()
        prefab.prefab(tank)
        this.entity.appendChild(tank);

        tank.getComponent(TransformComponent).setGlobal({
            position: event.respawnPosition,
            angle: event.respawnAngle
        })

        playerTankComponent.setTank(tank)
    }
}