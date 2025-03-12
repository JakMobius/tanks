import Entity from "src/utils/ecs/entity"
import CollisionIgnoreList from "./collision-ignore-list"
import { createTransmitterComponentFor } from "../network/transmitting/transmitter-component"
import CollisionIgnoreListTransmitter from "./collision-ignore-list-transmitter"

export default class CollisionIgnore {
    static collisionList(entity: Entity) {
        let list = entity.getComponent(CollisionIgnoreList)
        if(!list) {
            list = new CollisionIgnoreList()
            entity.addComponent(list)
            entity.addComponent(createTransmitterComponentFor(CollisionIgnoreListTransmitter))
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