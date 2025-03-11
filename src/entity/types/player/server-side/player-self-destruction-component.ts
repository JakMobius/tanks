import PlayerConnectionManagerComponent from "src/entity/types/player/server-side/player-connection-manager-component";
import Entity from "src/utils/ecs/entity";
import {UserSelfDestructMessageTransmitter} from "src/entity/components/network/event/user-message-transmitters";
import HealthComponent from "src/entity/components/health/health-component";
import DamageReason, { DamageTypes } from "src/server/damage-reason/damage-reason";
import {PlayerActionType} from "src/networking/packets/game-packets/player-action-packet";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import PlayerTankComponent from "src/entity/types/player/server-side/player-tank-component";
import PlayerWorldComponent from "src/entity/types/player/server-side/player-world-component";
import PlayerRespawnActionComponent from "src/entity/types/player/server-side/player-respawn-action-component";
import TimerComponent from "../../timer/timer-component";
import TimerPrefab from "../../timer/server-prefab";

export default class PlayerSelfDestructionComponent extends EventHandlerComponent {

    private selfDestructionTimer = new Entity()
    private selfDestructionStarted = false
    private selfDestructionTime: number = 5

    constructor() {
        super()
        TimerPrefab.prefab(this.selfDestructionTimer)
        this.selfDestructionTimer.on("timer-finished", () => {
            this.cancelSelfDestruction()

            let tank = this.getPlayerTank()
            if(tank) {
                let damageReason = new DamageReason()
                damageReason.damageType = DamageTypes.SELF_DESTRUCT;
                tank.getComponent(HealthComponent).damage(Infinity, damageReason)
            }
        })

        this.eventHandler.on("user-action", (action: PlayerActionType) => {
            if(action === PlayerActionType.selfDestruct) {
                this.startSelfDestruction()
            } else if(action == PlayerActionType.selfDestructCancel) {
                this.cancelSelfDestruction()
            }
        })

        this.eventHandler.on("death", () => this.cancelSelfDestruction())
        this.eventHandler.on("world-set", () => this.cancelSelfDestruction())
        this.eventHandler.on("tank-set", () => this.cancelSelfDestruction())
    }

    private getPlayerTank() {
        return this.entity.getComponent(PlayerTankComponent).tank
    }

    private getPlayerWorld() {
        return this.entity.getComponent(PlayerWorldComponent).world
    }

    startSelfDestruction() {
        let tank = this.getPlayerTank()
        let world = this.getPlayerWorld()
        if(!tank || !world) return

        if(this.selfDestructionStarted) return
        this.selfDestructionStarted = true

        if(tank.getComponent(HealthComponent).getHealth() <= 0) {
            this.entity.getComponent(PlayerRespawnActionComponent).performRespawnAction()
            return
        }

        world.appendChild(this.selfDestructionTimer)
        this.selfDestructionTimer.getComponent(TimerComponent).countdownFrom(this.selfDestructionTime)

        let connectionManager = this.entity.getComponent(PlayerConnectionManagerComponent)
        let transmitterSet = connectionManager.getWorldTransmitterSet()
        let transmitter = transmitterSet.getTransmitter(UserSelfDestructMessageTransmitter)
        transmitter.selfDestructionStarted(this.selfDestructionTimer)
    }

    cancelSelfDestruction() {
        if(!this.selfDestructionStarted) return
        this.selfDestructionStarted = false
        this.selfDestructionTimer.removeFromParent()

        let connectionManager = this.entity.getComponent(PlayerConnectionManagerComponent)
        let transmitterSet = connectionManager.getWorldTransmitterSet()

        // It might occur if player left the session
        // TODO: figure out where it can happen
        if(!transmitterSet) return
        let transmitter = transmitterSet.getTransmitter(UserSelfDestructMessageTransmitter)
        transmitter.selfDestructionCancelled()
    }
}