
import Entity from "src/utils/ecs/entity";

export default class MapModification {

    map: Entity = null

    constructor(map: Entity) {
        this.map = map
    }

    perform() {

    }

    revert() {

    }
}