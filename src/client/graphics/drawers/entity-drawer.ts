
import DrawPhase from "./draw-phase";
import {Component} from "../../../utils/ecs/component";
import Entity from "../../../utils/ecs/entity";
import WorldDrawerComponent from "../../entity/components/world-drawer-component";
import BasicEventHandlerSet from "../../../utils/basic-event-handler-set";
import {World} from "../../../library/box2d";

export default class EntityDrawer implements Component {
	public entity: Entity;
    public drawer: WorldDrawerComponent
    public enabled: boolean = true
    public eventListener = new BasicEventHandlerSet()

    constructor() {
        this.eventListener.on("world-drawer-attached", (drawer: WorldDrawerComponent) => this.setDrawer(drawer))
        this.eventListener.on("attached-to-parent", (child, parent) => {
            if(!this.drawer) this.findDrawer(parent)
        })
        this.eventListener.on("will-detach-from-parent", (child, parent) => {
            if(this.drawer) this.findDrawer(this.entity, child)
        })
    }

    /**
     * Draws the specified entity.
     */
    draw(phase: DrawPhase) {}

    onAttach(entity: Entity): void {
        this.entity = entity
        this.eventListener.setTarget(this.entity)
        this.findDrawer()
    }

    onDetach(): void {
        this.entity = null
        this.eventListener.setTarget(this.entity)
        if(this.drawer) {
            this.drawer.removeDrawer(this)
        }
    }

    private findDrawer(startFrom: Entity = this.entity, endWith: Entity = null) {
        let entity = startFrom
        let host = null

        while(entity && !host) {
            host = entity.getComponent(WorldDrawerComponent)
            if(entity == endWith) break;
            entity = entity.parent
        }

        this.setDrawer(host)
    }

    setDrawer(drawer: WorldDrawerComponent) {
        if(drawer == this.drawer) return
        if(this.drawer) {
            this.drawer.removeDrawer(this)
        }
        this.drawer = drawer
        if(this.drawer) {
            this.drawer.addDrawer(this)
        }
    }
}