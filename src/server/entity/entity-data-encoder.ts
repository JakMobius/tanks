import {Component} from "../../utils/ecs/component";
import Entity from "../../utils/ecs/entity";
import WriteBuffer from "../../serialization/binary/write-buffer";
import PhysicalComponent from "../../entity/components/physics-component";

export default class EntityDataEncoder implements Component {
    entity: Entity | null;

    onAttach(entity: Entity): void {
        this.entity = entity
    }

    onDetach(): void {
        this.entity = null
    }

    private encodePositionVelocity(encoder: WriteBuffer) {
        let body = this.entity.getComponent(PhysicalComponent).getBody()
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
}