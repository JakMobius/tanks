import { ControlsResponder } from "src/client/controls/root-controls-responder";
import Entity from "src/utils/ecs/entity";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import TankControls from "src/controls/tank-controls";
import PrimaryPlayerReceiver from "./primary-player/primary-player-receiver";

export default class PrimaryEntityControls extends EventHandlerComponent {

    controls: ControlsResponder
    currentEntity: Entity | null = null

    constructor(controls: ControlsResponder) {
        super()
        this.controls = controls
        this.eventHandler.on("primary-entity-set", () => this.updateControls())
    }

    updateControls() {
        if(this.currentEntity) {
            this.controls.disconnectTankControls(this.currentEntity.getComponent(TankControls))
        }

        this.currentEntity = this.entity.getComponent(PrimaryPlayerReceiver).primaryEntity

        if(this.currentEntity) {
            this.controls.connectTankControls(this.currentEntity.getComponent(TankControls))
        }
    }

    onAttach(entity: Entity): void {
        super.onAttach(entity)
        this.updateControls()
    }
}