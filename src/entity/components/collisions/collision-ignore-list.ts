import Entity from "src/utils/ecs/entity";
import * as Box2D from "@box2d/core"
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import { getObjectFromBody } from "../../physical-body-data";

export default class CollisionIgnoreList extends EventHandlerComponent {
    ignoreList = new Set<Entity>()

    constructor() {
        super()
        this.eventHandler.on("should-collide", (body: Box2D.b2Body) => {
            let entity = getObjectFromBody(body).entity?.deref()
            return !this.ignoreList.has(entity);
        })
    }

    ignoreCollisionsWith(entity: Entity) {
        this.entity.emit("collision-ignore-list-add", entity)
        this.ignoreList.add(entity)
    }

    enableCollisionsWith(entity: Entity) {
        this.entity.emit("collision-ignore-list-remove", entity)
        this.ignoreList.delete(entity)
    }
}