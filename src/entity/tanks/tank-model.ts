
import TankBehaviour from './physics/tank-behaviour';
import TankControls from '../../controls/tank-controls';
import EntityModel from "../entity-model";
import Matrix3 from "../../utils/matrix3";
import PhysicalComponent from "../physics-component";

/**
 * Tank model. Combines the physical model
 * of the tank, its behavior and controls.
 * This class used both on client and server
 * side. Can be updated dynamically through
 * binary serialization.
 */

export default class TankModel<BehaviourClass extends TankBehaviour = any> extends EntityModel {
    static Types = new Map();

    // Physical behaviour of this tank
    behaviour: BehaviourClass = null
    controls: TankControls = null

    /**
     * Transition matrix from tank space to the world space
     */
    matrix: Matrix3 = new Matrix3()

    constructor() {
        super()
        this.controls = new TankControls(this)

        this.on("physics-tick", (dt) => {
            this.behaviour.tick(dt)
            const body = this.getComponent(PhysicalComponent).getBody()
            const position = body.GetPosition()
            this.matrix.reset()
            this.matrix.translate(position.x, position.y)
            this.matrix.rotate(-body.GetAngle())
        })
    }
}
