import { Modification } from "src/client/map-editor/history/history-manager";
import { EntityProperty } from "./property-inspector";
import Entity from "src/utils/ecs/entity";

export default class PropertyModification implements Modification {
    actionName: string
    oldValue: any
    newValue: any
    property: EntityProperty
    entity: Entity

    constructor(entity: Entity, property: EntityProperty, value: any) {
        this.entity = entity
        this.oldValue = property.getValue()
        this.newValue = value
        this.property = property
        this.actionName = `Изменение ${property.name}`
    }

    perform() {
        // Use setter instead of setValue because setValue would trigger will-set
        // event, thus registering another unwanted modification in the history
        this.property.setter(this.newValue)
        this.entity.emit("request-focus-self")
    }

    revert() {
        // Same as above
        this.property.setter(this.oldValue)
        this.entity.emit("request-focus-self")
    }
}