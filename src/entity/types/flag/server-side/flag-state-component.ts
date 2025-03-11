import {Component} from "src/utils/ecs/component";
import Entity from "src/utils/ecs/entity";
import Team from "src/server/team";
import * as Box2D from "@box2d/core";
import TransformComponent from "src/entity/components/transform/transform-component";
import { WorldComponent } from "src/entity/game-world-entity-prefab";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import { TransmitterSet } from "src/entity/components/network/transmitting/transmitter-set";
import FlagStateTransmitter from "src/entity/types/flag/server-side/flag-state-transmitter";

export class FlagStateComponent extends EventHandlerComponent {
    team: Team
    basePosition: Box2D.XY | null = null
    carrier: Entity | null = null
    atBase: boolean = false
    contacts: Map<Entity, number> = new Map()

    constructor() {
        super()
        this.eventHandler.on("transmitter-set-added", (transmitterSet: TransmitterSet) => {
            transmitterSet.initializeTransmitter(FlagStateTransmitter)
        })
    }

    addContact(entity: Entity) {
        let count = this.contacts.get(entity) || 0
        this.contacts.set(entity, count + 1)
        return count + 1
    }

    removeContact(entity: Entity) {
        let count = this.contacts.get(entity) || 0
        if(count > 1) {
            this.contacts.set(entity, count - 1)
        } else {
            this.contacts.delete(entity)
        }
        return count - 1
    }

    setTeam(team: Team) {
        this.team = team
        this.entity.emit("team-set")
    }

    private setParent(parent: Entity) {
        if(parent === this.entity.parent) return
        this.entity.removeFromParent()
        parent?.appendChild(this.entity)
    }

    captureBy(entity: Entity) {
        this.carrier = entity
        this.atBase = false
        this.setParent(this.carrier)
        this.entity.getComponent(TransformComponent).set({
            position: { x: -1.3, y: 0 }
        })
    }

    drop() {
        this.carrier = null
        let transformComponent = this.entity.getComponent(TransformComponent)
        let globalPosition = transformComponent.getGlobalPosition()
        let world = WorldComponent.getWorld(this.entity)
        this.setParent(world)
        transformComponent.setGlobal({ position: globalPosition })
    }

    returnToBase() {
        this.carrier = null
        this.atBase = true
        this.setParent(WorldComponent.getWorld(this.entity))
        let transformComponent = this.entity.getComponent(TransformComponent)
        transformComponent.setGlobal({ position: this.basePosition })
    }
}