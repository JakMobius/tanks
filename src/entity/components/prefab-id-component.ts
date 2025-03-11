import {Component} from "src/utils/ecs/component";
import Entity from "src/utils/ecs/entity";
import ServerWorldPlayerManagerComponent from "src/server/entity/components/server-world-player-manager-component";
import { EntityPrefab } from "../entity-prefabs";

export default class PrefabComponent implements Component {
    entity: Entity | null = null
    prefab: EntityPrefab

    constructor(prefab: EntityPrefab) {
        this.prefab = prefab
    }

    onAttach(entity: Entity) {
        this.entity = entity
    }

    onDetach() {
        this.entity = null
    }
}

export function getPrefabNameForEntity(entity: Entity) {
    if (!entity) {
        return "NULL"
    }
    if (entity.getComponent(ServerWorldPlayerManagerComponent)) {
        return "WORLD"
    }
    let prefab = entity.getComponent(PrefabComponent)?.prefab
    return prefab?.getDisplayName() ?? "NULL"
}

export function getPrefabNamesForParents(entity: Entity): string {
    if (!entity) return "NULL"
    let name = this.getPrefabNameForEntity(entity)
    if (entity.parent) {
        return this.getPrefabNamesForParents(entity.parent) + " - " + name
    }
    return name
}