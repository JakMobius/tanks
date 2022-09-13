import {Component} from "../../../utils/ecs/component";
import Entity from "../../../utils/ecs/entity";
import BasicEventHandlerSet from "../../../utils/basic-event-handler-set";
import Player from "../../player";
import DamageReason from "../../damage-reason/damage-reason";
import PlayerDisconnectEvent from "../../../events/player-disconnect-event";
import EntityDamageEvent from "../../../events/tank-damage-event";
import ServerEntityPilotListComponent from "./server-entity-pilot-list-component";

export class PlayerDamageData {
    player: Player
    damagers: Player[] = []
    rowKills: Map<Player, number> = new Map()
    isDead: boolean = false

    constructor(player: Player) {
        this.player = player
    }
    
    addDamager(player: Player) {
        this.resetIfDead()

        let index = this.damagers.indexOf(player)
        if (index != -1) {
            this.damagers.splice(index, 1)
        }

        if(this.damagers.unshift(player) > DamageRecorderComponent.MAX_DAMAGERS) {
            this.damagers.pop()
        }
    }

    addKill(player: Player) {
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

export default class DamageRecorderComponent implements Component {
    static MAX_DAMAGERS = 5

    entity: Entity | null;
    eventHandler = new BasicEventHandlerSet()
    damageData: Map<Player, PlayerDamageData> = new Map()

    constructor() {
        this.eventHandler.on("entity-damage", (event: EntityDamageEvent) => {
            if(event.cancelled) return
            let playerListComponent = event.entity.getComponent(ServerEntityPilotListComponent)
            if(playerListComponent) {
                for(let player of playerListComponent.players) {
                    this.onPlayerDamage(player, event.damage, event.damageReason)
                }
            }
        })

        this.eventHandler.on("player-death", (player) => {
            this.onPlayerDeath(player)
        })

        this.eventHandler.on("player-disconnect", (event: PlayerDisconnectEvent) => {
            this.damageData.delete(event.player)
        })
    }

    onAttach(entity: Entity): void {
        this.entity = entity
        this.eventHandler.setTarget(entity)
    }

    onDetach(): void {
        this.entity = null
        this.eventHandler.setTarget(null)
    }

    getDamageData(player: Player) {
        let data = this.damageData.get(player)
        if (!data) {
            data = new PlayerDamageData(player)
            this.damageData.set(player, data)
        }
        return data
    }

    private onPlayerDeath(player: Player) {
        this.handleDeath(this.getDamageData(player))
    }

    private onPlayerDamage(player: Player, damage: number, reason: DamageReason) {
        if(!reason.players) return

        for(let damager of reason.players) {
            this.handleDamage(this.getDamageData(player), this.getDamageData(damager))
        }
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