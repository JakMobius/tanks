import DamageReason from "src/server/damage-reason/damage-reason";
import PlayerWillDisconnectEvent from "src/events/player-will-disconnect-event";
import EntityDamageEvent from "src/events/tank-damage-event";
import ServerEntityPilotComponent from "src/server/entity/components/server-entity-pilot-component";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import Entity from "src/utils/ecs/entity";

export class PlayerDamageData {
    player: Entity
    damagers: Entity[] = []
    rowKills: Map<Entity, number> = new Map()
    isDead: boolean = false

    constructor(player: Entity) {
        this.player = player
    }
    
    addDamager(player: Entity) {
        this.resetIfDead()

        let index = this.damagers.indexOf(player)
        if (index != -1) {
            this.damagers.splice(index, 1)
        }

        if(this.damagers.unshift(player) > DamageRecorderComponent.MAX_DAMAGERS) {
            this.damagers.pop()
        }
    }

    addKill(player: Entity) {
        this.resetIfDead()

        let rowKills = this.rowKills.get(player) || 0
        this.rowKills.set(player, rowKills + 1)
    }

    markDead() {
        this.resetIfDead()
        this.isDead = true
    }

    private resetIfDead() {
        if (!this.isDead) {
            return;
        }

        this.isDead = false
        this.damagers = []
        this.rowKills.clear()
    }
}

export default class DamageRecorderComponent extends EventHandlerComponent {
    static MAX_DAMAGERS = 5
    damageData: Map<Entity, PlayerDamageData> = new Map()

    constructor() {
        super()
        this.eventHandler.on("entity-damage", (event: EntityDamageEvent) => {
            if(event.cancelled) return
            let pilotComponent = event.entity.getComponent(ServerEntityPilotComponent)
            if(pilotComponent && pilotComponent.pilot) {
                this.onPlayerDamage(pilotComponent.pilot, event.damage, event.damageReason)
            }
        })

        this.eventHandler.on("player-death", (player) => {
            this.onPlayerDeath(player)
        })

        this.eventHandler.on("player-will-disconnect", (player: Entity, event: PlayerWillDisconnectEvent) => {
            this.damageData.delete(player)
        })
    }

    getDamageData(player: Entity) {
        let data = this.damageData.get(player)
        if (!data) {
            data = new PlayerDamageData(player)
            this.damageData.set(player, data)
        }
        return data
    }

    private onPlayerDeath(player: Entity) {
        this.handleDeath(this.getDamageData(player))
    }

    private onPlayerDamage(player: Entity, damage: number, reason: DamageReason) {
        if(!reason.player) return

        this.handleDamage(this.getDamageData(player), this.getDamageData(reason.player))
    }

    private handleDamage(playerData: PlayerDamageData, damagerData: PlayerDamageData) {
        playerData.addDamager(damagerData.player)
    }

    private handleDeath(playerData: PlayerDamageData) {
        let killer = playerData.damagers[0]
        if (killer) {
            this.getDamageData(killer).addKill(playerData.player)
        }

        playerData.markDead()
    }
}