import {Component} from "../../utils/ecs/component";
import Entity from "../../utils/ecs/entity";
import BasicEventHandlerSet from "../../utils/basic-event-handler-set";
import AdapterLoop from "../../utils/loop/adapter-loop";
import PhysicalHostComponent from "../../physiсal-world-component";

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