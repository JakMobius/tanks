import Entity from "./entity"

// TODO: maybe optimize this

export default class EntityContextProvider {

    entity: Entity | null = null

    addHandler?: (entity: Entity) => void
    removeHandler?: (entity: Entity) => void

    childAddHandler = (child: Entity) => {
        this.addHandler?.(child)
        child.on("child-added", this.childAddHandler)
        child.on("did-remove-child", this.childRemoveHandler)

        for (let nestedChild of child.children) {
            this.childAddHandler(nestedChild)
        }
    }

    childRemoveHandler = (child: Entity) => {
        this.removeHandler?.(child)
        child.off("child-added", this.childAddHandler)
        child.off("did-remove-child", this.childRemoveHandler)

        for (let nestedChild of child.children) {
            this.childRemoveHandler(nestedChild)
        }
    }

    setEntity(entity: Entity | null) {
        if(entity === this.entity) return this
        if(this.entity) this.childRemoveHandler(this.entity)
        this.entity = entity
        if(this.entity) this.childAddHandler(this.entity)
        return this
    }

    setAddHandler(handler: (entity: Entity) => void) {
        this.addHandler = handler
        return this
    }

    setRemoveHandler(handler: (entity: Entity) => void) {
        this.removeHandler = handler
        return this
    }
}