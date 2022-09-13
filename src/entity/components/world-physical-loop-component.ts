import {Component} from "src/utils/ecs/component";
import Entity from "src/utils/ecs/entity";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import AdapterLoop from "src/utils/loop/adapter-loop";
import PhysicalHostComponent from "src/physiсal-world-component";

export default class WorldPhysicalLoopComponent implements Component {
    entity: Entity | null;
    private worldEventHandler = new BasicEventHandlerSet()
    loop: AdapterLoop

    constructor(loop: AdapterLoop) {
        this.loop = loop
        this.worldEventHandler.on("tick", (dt: number) => {
            this.loop.timePassed(dt)
        })

        loop.run = () => this.entity.getComponent(PhysicalHostComponent).tickPhysics()
        loop.start()
    }

    onAttach(entity: Entity): void {
        this.entity = entity
        this.worldEventHandler.setTarget(entity)
    }

    onDetach(): void {
        this.entity = null
        this.worldEventHandler.setTarget(null)
    }
}