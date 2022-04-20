import {Component} from "../../utils/ecs/component";
import Entity from "../../utils/ecs/entity";
import ReadBuffer from "../../serialization/binary/read-buffer";
import ServerPosition from "./server-position";
import HealthComponent from "../../entity/components/health-component";

export default class EntityDataDecoder implements Component {
    entity: Entity | null;

    onAttach(entity: Entity): void {
        this.entity = entity
    }

    onDetach(): void {
        this.entity = null
    }

    decodeInitialData(decoder: ReadBuffer) {
        this.entity.getComponent(ServerPosition).decodePosition(decoder)

        const healthComponent = this.entity.getComponent(HealthComponent)
        healthComponent.setHealth(decoder.readFloat32())
    }

    decodeDynamicData(decoder: ReadBuffer) {
        this.entity.getComponent(ServerPosition).decodeMovement(decoder)
    }
}