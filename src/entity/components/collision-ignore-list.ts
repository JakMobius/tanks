import Entity from "src/utils/ecs/entity";
import {TransmitterSet} from "./network/transmitting/transmitter-set";
import CollisionIgnoreListTransmitter from "./network/collisions/collision-ignore-list-transmitter";
import * as Box2D from "@box2d/core"
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import { getObjectFromBody } from "../physical-body-data";

export default class CollisionIgnoreList extends EventHandlerComponent {
    ignoreList = new Set<Entity>()

    constructor() {
        super()
        this.eventHandler.on("should-collide", (body: Box2D.b2Body) => {
            let entity = getObjectFromBody(body).entity?.deref()
            return !this.ignoreList.has(entity);
        })

        this.eventHandler.on("transmitter-set-added", (transmitterSet: TransmitterSet) => {
            transmitterSet.initializeTransmitter(CollisionIgnoreListTransmitter)
        })
    }

    private ignoreCollisionsWith(entity: Entity) {
        this.entity.emit("collision-ignore-list-add", entity)
        this.ignoreList.add(entity)
    }

    private enableCollisionsWith(entity: Entity) {
        this.entity.emit("collision-ignore-list-remove", entity)
        this.ignoreList.delete(entity)
    }

    static collisionList(entity: Entity) {
        let list = entity.getComponent(CollisionIgnoreList)
        if(!list) {
            list = new CollisionIgnoreList()
            entity.addComponent(list)
        }
        return list
    }

    static ignoreCollisions(a: Entity, b: Entity) {
        let aList = this.collisionList(a)
        let bList = this.collisionList(b)

        aList.ignoreCollisionsWith(b);
        bList.ignoreCollisionsWith(a);
    }

    static enableCollisions(a: Entity, b: Entity) {
        let aList = this.collisionList(a)
        let bList = this.collisionList(b)

        aList.enableCollisionsWith(b);
        bList.enableCollisionsWith(a);
    }
}