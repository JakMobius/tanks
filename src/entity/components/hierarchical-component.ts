import Entity from "../../utils/ecs/entity";
import BasicEventHandlerSet from "../../utils/basic-event-handler-set";
import {Component} from "../../utils/ecs/component";

export default class HierarchicalComponent implements Component {
    entity: Entity | null;
    eventHandler = new BasicEventHandlerSet()

    constructor() {

        this.eventHandler.on("will-detach-from-parent", (child) => {
            if(child != this.entity) return;
            this.detachFromParentComponent()
        })

        this.eventHandler.on("attached-to-parent", (child) => {
            if(child != this.entity) return;
            this.attachToParentComponent()
        })

    }

    onAttach(entity: Entity): void {
        this.entity = entity
        this.eventHandler.setTarget(entity)

        this.attachChildrenComponents()
        this.attachToParentComponent()
    }

    onDetach(): void {
        this.detachChildComponents()
        this.detachFromParentComponent()

        this.entity = null
        this.eventHandler.setTarget(null)
    }

    protected attachChildrenComponents() {
        for(let child of this.entity.children) {
            let childComponent = child.getComponent(this.constructor as typeof HierarchicalComponent)
            if(!childComponent) continue
            childComponent.attachToParentComponent()
        }
    }

    protected detachChildComponents() {
        for(let child of this.entity.children) {
            let childComponent = child.getComponent(this.constructor as typeof HierarchicalComponent)
            if(!childComponent) continue
            childComponent.detachFromParentComponent()
        }
    }

    protected attachToParentComponent() {
        let parent = this.entity.parent
        if(!parent) return
        let parentComponent = parent.getComponent(this.constructor as typeof HierarchicalComponent)
        if(!parentComponent) return
        parentComponent.childComponentAdded(this)
    }

    protected detachFromParentComponent() {
        let parent = this.entity.parent
        if(!parent) return
        let parentComponent = parent.getComponent(this.constructor as typeof HierarchicalComponent)
        if(!parentComponent) return
        parentComponent.childComponentDetached(this)
    }

    protected childComponentAdded(component: HierarchicalComponent) {

    }

    protected childComponentDetached(component: HierarchicalComponent) {

    }
}