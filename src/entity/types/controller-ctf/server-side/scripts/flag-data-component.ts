import {Component} from "src/utils/ecs/component";
import Entity from "src/utils/ecs/entity";
import Team from "src/server/team";
import * as Box2D from "@box2d/core";
import FlagStateComponent from "src/entity/types/flag/flag-state-component";
import TransformComponent from "src/entity/components/transform-component";

export class FlagDataComponent implements Component {
    entity: Entity
    team: Team
    basePosition: Box2D.XY | null = null
    carrier: Entity | null = null
    atBase: boolean = false
    contacts: Map<Entity, number> = new Map()

    onAttach(entity: Entity): void {
        this.entity = entity
    }

    onDetach(): void {
        this.entity = null
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
        this.entity.getComponent(FlagStateComponent).setTeam(team.id)
    }

    captureBy(entity: Entity) {
        this.entity.getComponent(FlagStateComponent).setCarrier(entity)
        this.carrier = entity
        this.atBase = false
    }

    drop() {
        let position = this.entity.getComponent(TransformComponent).getPosition()
        this.entity.getComponent(FlagStateComponent).setPosition(position)
        this.carrier = null
    }

    returnToBase() {
        this.carrier = null
        this.atBase = true
        this.entity.getComponent(FlagStateComponent).setPosition(this.basePosition)
    }
}