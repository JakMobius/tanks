import {Component} from "src/utils/ecs/component";
import Entity from "src/utils/ecs/entity";
import {EntityType} from "src/entity/entity-type";
import ServerWorldPlayerManagerComponent from "src/server/entity/components/server-world-player-manager-component";

export default class PrefabIdComponent implements Component {
    entity: Entity | null = null
    prefabId: number

    constructor(id: number) {
        this.prefabId = id
    }

    onAttach(entity: Entity) {
        this.entity = entity
    }

    onDetach() {
        this.entity = null
    }

    static getPrefabNameForEntity(entity: Entity) {
        if (!entity) {
            return "NULL"
        }
        let index = entity.getComponent(PrefabIdComponent)?.prefabId

        for (let key in EntityType) {
            if (index === (EntityType as { [key: string]: number })[key]) return key
        }

        if (entity.getComponent(ServerWorldPlayerManagerComponent)) {
            return "WORLD"
        }

        return "<unknown entity>"
    }

    static getPrefabNamesForParents(entity: Entity): string {
        if (!entity) {
            return "NULL"
        }
        let name = this.getPrefabNameForEntity(entity)
        if (entity.parent) {
            return this.getPrefabNamesForParents(entity.parent) + " - " + name
        }
        return name
    }
}