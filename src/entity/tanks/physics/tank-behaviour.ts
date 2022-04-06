
import TankModel from '../tank-model';
import {Vec2} from "../../../library/box2d";
import TankControls from "../../../controls/tank-controls";
import {Component} from "../../../utils/ecs/component";
import Entity from "../../../utils/ecs/entity";

/**
 * Class which defines the physical behaviour of each specific type of tank (tracked, wheeled, etc.)
 */
export default class TankBehaviour implements Component {
	public entity: TankModel;

    protected localVector1 = new Vec2()
    protected localVector2 = new Vec2()
    protected localVector3 = new Vec2()
    protected localVector4 = new Vec2()

    protected controlsComponent?: TankControls
    private physicsTickHandler?: (dt: number) => void

    constructor(tank: TankModel) {
        this.entity = tank

        this.physicsTickHandler = (dt) => this.tick(dt)
    }

    protected updateControlsComponent() {
        if(!this.controlsComponent || this.controlsComponent.entity != this.entity) {
            this.controlsComponent = this.entity.getComponent(TankControls)
        }
    }

    tick(dt: number): void {
        this.updateControlsComponent();
    }

    onAttach(entity: Entity) {
        if(!(entity instanceof TankModel)) {
            throw new Error("TankBehaviour component may only be attached to entities of TankModel type")
        }
        this.entity = entity
        this.entity.on("physics-tick", this.physicsTickHandler);
    }

    onDetach() {
        if(this.entity) {
            this.entity.off("physics-tick", this.physicsTickHandler);
        }
        this.entity = null
    }
}