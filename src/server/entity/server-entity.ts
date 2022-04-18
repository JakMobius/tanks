import AbstractEntity from '../../entity/abstract-entity';
import EntityModel from "../../entity/entity-model";
import ServerGameWorld from "../server-game-world";
import {Constructor} from "../../serialization/binary/serializable";
import PhysicalComponent from "../../entity/physics-component";
import HealthComponent from "../../entity/health-component";
import ReadBuffer from "../../serialization/binary/read-buffer";
import WriteBuffer from "../../serialization/binary/write-buffer";

export default class ServerEntity extends AbstractEntity {
	public types: Map<Constructor<EntityModel>, Constructor<ServerEntity>>;
	public teleported: boolean = true
    static types = new Map()
    static globalId = 0

    constructor(model: EntityModel) {
        super(model);

        model.id = ServerEntity.globalId++
    }

    die() {
        this.model.dead = true
    }

    tick(dt: number) {
        this.model.tick(dt)
    }

    static fromModel(model: EntityModel): ServerEntity | null {
        let type = this.types.get(model.constructor)

        if(type) {
            return new type({
                model: model
            })
        }
        return null
    }

    static associate(serverClass: Constructor<ServerEntity>, modelClass: Constructor<EntityModel>): void {
        this.types.set(modelClass, serverClass)
    }

    decodeInitialData(decoder: ReadBuffer) {
	    throw new Error("Method not implemented")
    }

    decodeDynamicData(decoder: ReadBuffer): void {
        throw new Error("Method not implemented")
    }

    private encodePositionVelocity(encoder: WriteBuffer) {
        let body = this.model.getComponent(PhysicalComponent).getBody()
        let position = body.GetPosition()
        encoder.writeFloat32(position.x)
        encoder.writeFloat32(position.y)
        encoder.writeFloat32(body.GetAngle())

        let velocity = body.GetLinearVelocity()
        let angular = body.GetAngularVelocity()

        encoder.writeFloat32(velocity.x)
        encoder.writeFloat32(velocity.y)
        encoder.writeFloat32(angular)
    }

    encodeInitialData(encoder: WriteBuffer) {
        this.encodePositionVelocity(encoder)
        encoder.writeFloat32(this.model.getComponent(HealthComponent).getHealth())
    }

    encodeDynamicData(encoder: WriteBuffer): void {
        encoder.writeUint8(this.teleported as any as number)
        this.teleported = false
        this.encodePositionVelocity(encoder)
    }

    damage(damage: number): void {
        this.model.getComponent(HealthComponent).damage(damage)
    }
}