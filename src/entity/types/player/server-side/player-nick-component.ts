import {Component} from "src/utils/ecs/component";
import Entity from "src/utils/ecs/entity";

export default class PlayerNickComponent implements Component {
    entity: Entity | null
    nick: string | null = null

    onAttach(entity: Entity) {
        this.entity = entity
    }

    onDetach() {
        this.entity = null
    }
}