import {Constraint} from "src/physics/constraint-system/constraint-system";
import ConstraintSystemSolver from "src/physics/constraint-system/constraint-system-solver";

export default class DifferentialConstraint extends Constraint {
    inputGearIndex: number
    outputAIndex: number
    outputBIndex: number

    constructor(inputGearIndex: number, outputAIndex: number, outputBIndex: number) {
        super()
        this.inputGearIndex = inputGearIndex
        this.outputAIndex = outputAIndex
        this.outputBIndex = outputBIndex

        this.addOutput(this.inputGearIndex)
        this.addOutput(this.outputAIndex)
        this.addOutput(this.outputBIndex)

        this.outputs[0].J = 1
        this.outputs[0].Jdot = 0

        this.outputs[1].J = -0.5
        this.outputs[1].Jdot = 0

        this.outputs[2].J = -0.5
        this.outputs[2].Jdot = 0
    }

    apply(system: ConstraintSystemSolver) {

    }
}