
import CollisionIgnoreList from "src/entity/components/collisions/collision-ignore-list";
import Entity from "src/utils/ecs/entity";
import Transmitter from "../network/transmitting/transmitter";
import { Commands } from "../network/commands";

export default class CollisionIgnoreListTransmitter extends Transmitter {
    constructor() {
        super()
        this.eventHandler.on("collision-ignore-list-add", (entity) => {
            this.writeEntityCollisionListAdd(entity)
        })

        this.eventHandler.on("collision-ignore-list-remove", (entity) => {
            this.writeEntityCollisionListRemove(entity)
        })
    }

    onEnable() {
        super.onEnable()

        let component = this.set.transmitComponent.entity.getComponent(CollisionIgnoreList)
        for(let entity of component.ignoreList) {
            this.writeEntityCollisionListAdd(entity)
        }
    }

    writeEntityCollisionListRemove(entity: Entity) {
        if(!this.entityCanBePointed(entity)) return;

        this.packIfEnabled(Commands.COLLISION_IGNORE_LIST_REMOVE, (buffer) => {
            this.pointToEntity(entity)
        })
    }

    writeEntityCollisionListAdd(entity: Entity) {
        if(!this.entityCanBePointed(entity)) return;

        this.packIfEnabled(Commands.COLLISION_IGNORE_LIST_ADD, (buffer) => {
            this.pointToEntity(entity)
        })
    }
}
