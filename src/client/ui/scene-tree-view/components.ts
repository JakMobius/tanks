import { Component } from "src/utils/ecs/component"
import Entity from "src/utils/ecs/entity"
import EventHandlerComponent from "src/utils/ecs/event-handler-component"
import PrefabComponent from "src/entity/components/prefab-id-component"
import { PropertyInspector, StringProperty } from "src/entity/components/inspector/property-inspector"
import EntityContextProvider from "src/utils/ecs/entity-context-provider"
import { transmitterComponentFor } from "src/entity/components/network/transmitting/transmitter-component"
import EditorEventTransmitter from "src/client/map-editor/editor-event-transmitter"

export interface EntityTreeNode {
    id: string,
    name: string,
    children?: EntityTreeNode[]
    entity: Entity
}

export class EntityEditorTreeNodeComponent extends EventHandlerComponent {
    static counter = 0
    name?: string
    id: string
    descriptor: EntityTreeNode | null = null
    root: EntityEditorTreeRootComponent

    constructor() {
        super()
        this.id = (EntityEditorTreeNodeComponent.counter++).toString(36)

        this.eventHandler.on("inspector-added", (inspector: PropertyInspector) => {
            let property = new StringProperty("name")
                .withHidden(true)
                .withGetter(() => this.getName())
                .withSetter((name) => this.setName(name))
            inspector.addProperty(property)
        })

        this.eventHandler.on("will-detach-from-parent", () => {
            this.markDirty()
        })

        this.eventHandler.on("child-added", () => {
            this.markDirty()
        })
        
        this.eventHandler.on("request-focus-self", () => {
            this.root?.entity.emit("request-focus", this.entity)
        })
    }

    markDirty() {
        if(!this.descriptor) return
        this.entity.emit("tree-node-dirty")
        this.descriptor = null
        this.entity.parent?.getComponent(EntityEditorTreeNodeComponent)?.markDirty()
    }

    getName() {
        if(!this.entity) return null
        if(!this.name) {
            let prefab = this.entity.getComponent(PrefabComponent)?.prefab
            this.name = prefab?.getDisplayName() ?? "Entity " + this.id
        }
        return this.name
    }

    getDescriptor() {
        if (this.descriptor) return this.descriptor

        let children = this.entity.children.map(child => {
            return child.getComponent(EntityEditorTreeNodeComponent).getDescriptor()
        })

        this.descriptor = {
            id: this.id,
            name: this.getName(),
            children: children,
            entity: this.entity
        }
        return this.descriptor
    }

    onAttach(entity: Entity): void {
        super.onAttach(entity)
    }

    setName(name: string) {
        this.name = name
        this.entity.emit("name-set", name)
        this.markDirty()
    }

    setRoot(newRoot: EntityEditorTreeRootComponent) {
        if (newRoot !== this.root) {
            this.root = newRoot
            this.markDirty()
        }
    }
}

export class EntityEditorTreeRootComponent implements Component {
    entity?: Entity;
    map: Map<string, Entity> = new Map()

    context = new EntityContextProvider()
        .setAddHandler((entity: Entity) => this.onChildAdded(entity))
        .setRemoveHandler((entity: Entity) => this.onChildRemoved(entity))

    onAttach(entity: Entity): void {
        this.entity = entity
        this.context.setEntity(this.entity)
    }

    onDetach(): void {
        this.entity = null
        this.context.setEntity(null)
    }

    addNode(node: EntityEditorTreeNodeComponent) {
        this.map.set(node.id, node.entity)
    }

    removeNode(node: EntityEditorTreeNodeComponent) {
        this.map.delete(node.id)
    }

    onChildAdded(entity: Entity) {
        let EventTransmitterComponent = transmitterComponentFor(EditorEventTransmitter)

        if(!entity.getComponent(EventTransmitterComponent)) 
            entity.addComponent(new EventTransmitterComponent())

        if(!entity.getComponent(EntityEditorTreeNodeComponent))
            entity.addComponent(new EntityEditorTreeNodeComponent())
        
        let node = entity.getComponent(EntityEditorTreeNodeComponent)
        node.setRoot(this)
        this.map.set(node.id, entity)
    }

    onChildRemoved(entity: Entity) {
        let node = entity.getComponent(EntityEditorTreeNodeComponent)
        node.setRoot(null)
        this.map.delete(node.id)
    }
}