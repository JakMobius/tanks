import { Component } from "src/utils/ecs/component"
import Entity from "src/utils/ecs/entity"
import EventHandlerComponent from "src/utils/ecs/event-handler-component"
import { TreeNodeBase } from "../tree-view/tree-view"

export interface EntityTreeNode extends TreeNodeBase {
    id: string,
    name: string,
    parent?: string,
    children?: EntityTreeNode[]
}

export class EntityEditorTreeNodeComponent extends EventHandlerComponent {
    static counter = 0
    name: string = "Unnamed"
    id: string
    descriptor: EntityTreeNode | null = null
    root: EntityEditorTreeRootComponent

    constructor(name?: string) {
        super()
        this.eventHandler.on("child-added", (child) => this.onChildAdded(child))
        this.eventHandler.on("did-remove-child", (child) => this.onChildRemoved(child))
        this.id = (EntityEditorTreeNodeComponent.counter++).toString(36)
        if (name) this.name = name
        else this.name = "Entity " + this.id
    }

    markDirty() {
        this.descriptor = null
        this.entity.parent?.getComponent(EntityEditorTreeNodeComponent)?.markDirty()
    }

    getDescriptor() {
        if (this.descriptor) return this.descriptor

        let children = this.entity.children.map(child => {
            return child.getComponent(EntityEditorTreeNodeComponent).getDescriptor()
        })

        this.descriptor = {
            id: this.id,
            name: this.name,
            children: children
        }
        return this.descriptor
    }

    onAttach(entity: Entity): void {
        super.onAttach(entity)
        for (let child of entity.children) {
            this.onChildAdded(child)
        }
    }

    onChildAdded(child: Entity) {
        this.markDirty()
        let component = child.getComponent(EntityEditorTreeNodeComponent)
        if (!component) {
            component = new EntityEditorTreeNodeComponent()
            child.addComponent(component)
        }
        component.updateRoot()
    }

    onChildRemoved(child: Entity) {
        this.markDirty()
        child.getComponent(EntityEditorTreeNodeComponent)?.updateRoot()
    }

    setName(name: string) {
        this.name = name
    }

    updateRoot() {
        let newRoot = null
        let entity = this.entity

        while (entity) {
            let rootComponent = entity.getComponent(EntityEditorTreeRootComponent)
            if (rootComponent) break
            entity = entity.parent
            continue
        }

        if (entity) {
            newRoot = entity.getComponent(EntityEditorTreeRootComponent)
        }

        if (newRoot !== this.root) {
            this.root?.removeNode(this)
            this.root = newRoot
            this.root?.addNode(this)
            this.markDirty()
        }
    }
}

export class EntityEditorTreeRootComponent implements Component {
    entity?: Entity;
    map: Map<string, Entity> = new Map()

    onAttach(entity: Entity): void {
        this.entity = entity
    }

    onDetach(): void {
        this.entity = null
    }

    addNode(node: EntityEditorTreeNodeComponent) {
        this.map.set(node.id, node.entity)
    }

    removeNode(node: EntityEditorTreeNodeComponent) {
        this.map.delete(node.id)
    }
}