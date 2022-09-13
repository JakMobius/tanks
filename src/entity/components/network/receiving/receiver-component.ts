import Entity from "../../../../utils/ecs/entity";
import EntityDataReceiveComponent from "./entity-data-receive-component";
import ReadBuffer from "../../../../serialization/binary/read-buffer";
import GameObjectReader from "./game-object-reader";

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

    readEntity(buffer: ReadBuffer): Entity {
        return EntityDataReceiveComponent.performNavigation(buffer, this.entity)
    }

    readObject(buffer: ReadBuffer): any {
        return GameObjectReader.instance.readWithReceiver(buffer, this)
    }

    onDetach(): void {
        this.entity = null
    }
}