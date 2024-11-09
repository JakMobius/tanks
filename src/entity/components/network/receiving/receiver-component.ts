import Entity from "src/utils/ecs/entity";
import EntityDataReceiveComponent from "./entity-data-receive-component";
import ReadBuffer from "src/serialization/binary/read-buffer";
import GameObjectReader from "./game-object-reader";

export default class ReceiverComponent {
    entity: Entity | null;
    receiveComponent: EntityDataReceiveComponent | null = null

    hook(component: EntityDataReceiveComponent) {

    }

    onAttach(entity: Entity): void {
        this.entity = entity
        let component = this.entity.getComponent(EntityDataReceiveComponent)
        if (component) {
            this.receiveComponent = component
            this.hook(component)
        }
    }

    onDetach(): void {
        this.entity = null
    }
}