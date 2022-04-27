import {Component} from "../../utils/ecs/component";
import Entity from "../../utils/ecs/entity";
import BasicEventHandlerSet from "../../utils/basic-event-handler-set";
import {TransmitterSet} from "./network/transmitting/transmitter-set";
import CollisionIgnoreListTransmitter from "./network/collisions/collision-ignore-list-transmitter";
import * as Box2D from "../../library/box2d"

export default class CollisionIgnoreList implements Component {
    entity: Entity | null;
    ignoreList = new Set<Entity>()
    private entityHandler = new BasicEventHandlerSet()

    constructor() {
        this.entityHandler.on("should-collide", (body: Box2D.Body) => {
            return !this.ignoreList.has(body.GetUserData());
        })

        this.entityHandler.on("transmitter-set-attached", (transmitterSet: TransmitterSet) => {
            transmitterSet.initializeTransmitter(CollisionIgnoreListTransmitter)
        })
    }

    onAttach(entity: Entity): void {
        this.entity = entity
        this.entityHandler.setTarget(this.entity)
    }

    onDetach(): void {
        this.entity = null
        this.entityHandler.setTarget(this.entity)
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