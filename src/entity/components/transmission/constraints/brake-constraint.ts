import {Constraint} from "src/physics/constraint-system/constraint-system";

export default class BrakeConstraint extends Constraint {

    constructor(unitIndex: number) {
        super();

        this.addOutput(unitIndex)

        this.outputs[0].J = 1
        this.outputs[0].Jdot = 0

        this.setBrakeTorque(0)
    }

    setBrakeTorque(torque: number) {
        this.limitMax = torque
        this.limitMin = -torque
    }
}