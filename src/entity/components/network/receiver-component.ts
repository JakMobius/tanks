import Entity from "../../../utils/ecs/entity";
import EntityDataReceiveComponent from "./entity-data-receive-component";

export default class ReceiverComponent {
    entity: Entity | null;

    hook(component: EntityDataReceiveComponent) {

    }

    onAttach(entity: Entity): void {
        this.entity = entity
        let component = this.entity.getComponent(EntityDataReceiveComponent)
        if(component) {
            this.hook(component)
        }
    }

    onDetach(): void {
        this.entity = null
    }
}