import Entity from "src/utils/ecs/entity";
import EventEmitter from "src/utils/event-emitter";
import PlayerRespawnEvent from "src/events/player-respawn-event";
import PhysicalComponent from "src/entity/components/physics-component";
import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import PlayerPreferredTankComponent from "src/entity/types/player/server-side/player-preferred-tank-component";
import PlayerConnectionManagerComponent from "src/entity/types/player/server-side/player-connection-manager-component";
import {UserTankChangeOnRespawnMessageTransmitter} from "src/entity/components/network/event/user-message-transmitters";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import PlayerTankComponent from "src/entity/types/player/server-side/player-tank-component";
import PlayerRespawnActionComponent from "src/entity/types/player/server-side/player-respawn-action-component";

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

        const playerTankComponent = event.player.getComponent(PlayerTankComponent)

        if (playerTankComponent.tank) {
            let tank = playerTankComponent.tank
            playerTankComponent.setTank(null)
            tank.removeFromParent()
        }

        const tank = new Entity()
        ServerEntityPrefabs.types.get(preferredTank)(tank)
        this.entity.appendChild(tank);

        const body = tank.getComponent(PhysicalComponent)
        body.setPositionAngle(event.respawnPosition, event.respawnAngle)

        playerTankComponent.setTank(tank)
    }
}