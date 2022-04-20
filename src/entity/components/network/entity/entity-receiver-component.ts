
import EntityDataReceiveComponent from "../entity-data-receive-component";
import PhysicalComponent from "../../physics-component";
import {Commands} from "../commands";
import ReceiverComponent from "../receiver-component";
import ServerPosition from "../../../../client/entity/server-position";
import HealthComponent from "../../health-component";

export default class EntityReceiverComponent extends ReceiverComponent {

    hook(receiveComponent: EntityDataReceiveComponent): void {
        receiveComponent.commandHandlers.set(Commands.ENTITY_CREATE_COMMAND, (buffer) => {

        })

        receiveComponent.commandHandlers.set(Commands.ENTITY_REMOVE_COMMAND, (buffer) => {

        })
    }
}