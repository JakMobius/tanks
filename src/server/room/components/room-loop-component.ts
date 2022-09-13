import Entity from "../../../utils/ecs/entity";
import {Component} from "../../../utils/ecs/component";
import Loop from "../../../utils/loop/loop";

export default class RoomLoopComponent implements Component {
    entity: Entity | null;

    loop: Loop

    constructor(loop: Loop) {
        this.loop = loop
        loop.run = (dt) => this.entity.propagateEvent("tick", dt)
    }

    onAttach(entity: Entity): void {
        this.entity = entity
    }

    onDetach(): void {
        this.entity = null
    }
}