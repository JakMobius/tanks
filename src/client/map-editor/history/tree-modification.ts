import Entity from "src/utils/ecs/entity";
import { Modification } from "./history-manager";
import { MapEditorApi } from "../map-editor";
import { EntityEditorTreeNodeComponent } from "src/client/ui/scene-tree-view/components";

export interface InsertedEntity {
    entity: Entity
    parent: Entity
    previousSibling: Entity | null
}

export class TreeInsertionModification implements Modification {
    actionName: string
    entities: InsertedEntity[]
    editor: MapEditorApi

    constructor(actionName: string, editor: MapEditorApi, entities: Entity[]) {
        this.entities = entities.map(entity => {
            let index = entity.parent.children.indexOf(entity)

            return {
                entity: entity,
                parent: entity.parent,
                previousSibling: entity.parent.children[index - 1] ?? null,
            }
        })
        this.actionName = actionName
        this.editor = editor
    }

    perform() {
        for(let element of this.entities) {
            element.parent.insertChildAfter(element.entity, element.previousSibling)
        }
        this.editor.selectEntities(this.entities.map(selection => selection.entity))
    }

    revert() {
        for(let i = this.entities.length - 1; i >= 0; i--) {
            let element = this.entities[i]
            element.entity.removeFromParent()
        }
        this.editor.deselectEntities(this.entities.map(selection => selection.entity))
    }
}

export class TreeDeletionModification extends TreeInsertionModification {
    perform() {
        super.revert()
    }

    revert() {
        super.perform()
    }
}

export interface MovedEntity {
    entity: Entity

    oldParent: Entity
    oldPreviousSibling: Entity | null
    
    newParent?: Entity
    newPreviousSibling?: Entity | null
}

export class TreeMoveModification implements Modification {
    actionName: string
    editor: MapEditorApi
    entities: MovedEntity[] = []

    constructor(actionName: string, editor: MapEditorApi) {
        this.actionName = actionName
        this.editor = editor
    }

    moveEntity(entity: Entity, callback: () => void) {
        let index = entity.parent.children.indexOf(entity)
        let oldParent = entity.parent
        let oldPreviousSibling = entity.parent.children[index - 1] ?? null

        callback()

        index = entity.parent.children.indexOf(entity)
        let newParent = entity.parent
        let newPreviousSibling = entity.parent.children[index - 1] ?? null

        this.entities.push({
            entity,
            oldParent,
            oldPreviousSibling,
            newParent,
            newPreviousSibling,
        })
    }

    perform() {
        for(let element of this.entities) {
            if(element.oldParent === element.newParent && element.oldPreviousSibling === element.newPreviousSibling) {
                continue
            }
            element.entity.removeFromParent()
            element.newParent.insertChildAfter(element.entity, element.newPreviousSibling)
        }
        this.editor.selectEntities(this.entities.map(selection => selection.entity))
    }

    revert() {
        for(let i = this.entities.length - 1; i >= 0; i--) {
            let element = this.entities[i]
            if(element.oldParent === element.newParent && element.oldPreviousSibling === element.newPreviousSibling) {
                continue
            }
            element.entity.removeFromParent()
            element.oldParent.insertChildAfter(element.entity, element.oldPreviousSibling)
        }
        this.editor.selectEntities(this.entities.map(selection => selection.entity))
    }
}

export class NodeRenameModification {
    actionName: string
    editor: MapEditorApi
    node: Entity
    oldName: string
    newName: string

    constructor(editor: MapEditorApi, node: Entity, newName: string) {
        this.editor = editor
        this.node = node
        this.oldName = node.getComponent(EntityEditorTreeNodeComponent).name
        this.newName = newName
        this.actionName = `Переименование`
    }

    perform() {
        this.node.getComponent(EntityEditorTreeNodeComponent).setName(this.newName)
        this.editor.selectEntities([this.node])
    }

    revert() {
        this.node.getComponent(EntityEditorTreeNodeComponent).setName(this.oldName)
        this.editor.selectEntities([this.node])
    }
}