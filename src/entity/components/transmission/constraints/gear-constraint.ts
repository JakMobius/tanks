import {Constraint} from "src/physics/constraint-system/constraint-system";
import ConstraintSystemSolver from "src/physics/constraint-system/constraint-system-solver";

export class GearConstraint extends Constraint {
    private coefficient: number

    constructor(coefficient: number, gearA: number, gearB: number) {
        super()
        this.coefficient = coefficient

        this.addOutput(gearA)
        this.addOutput(gearB)

        this.value = 0
        this.outputs[0].J = -this.coefficient
        this.outputs[0].Jdot = 0

        this.outputs[1].J = 1
        this.outputs[1].Jdot = 0
    }

    setCoefficient(coefficient: number) {
        this.outputs[0].J = -coefficient
    }

    setMaxTorque(torque: number) {
        this.limitMax = torque
        this.limitMin = -torque
    }

    apply(system: ConstraintSystemSolver) {

    }
}