import Entity from "src/utils/ecs/entity";
import {Component} from "src/utils/ecs/component";
import Loop from "src/utils/loop/loop";

export default class RoomLoopComponent implements Component {
    entity: Entity | null;

    loop: Loop

    constructor(loop: Loop) {
        this.loop = loop
        loop.run = (dt) => {
            this.entity.emit("tick", dt)
        }
    }

    onAttach(entity: Entity): void {
        this.entity = entity
    }

    onDetach(): void {
        this.entity = null
    }
}