
import {ConstraintSystem} from "src/physics/constraint-system/constraint-system";
import {nextPowerOfTwo} from "src/utils/utils";
import GaussSeidelSolver from "src/physics/constraint-system/gauss-seidel-solver";
import {FastMatrix} from "src/physics/constraint-system/sparse-matrix";

export default class ConstraintSystemSolver {
    static shared = new ConstraintSystemSolver()

    matrixSolver = new GaussSeidelSolver()
    // matrixSolver = new ConjugateGradientSolver()
    // matrixSolver = new BCCGSolver()
    lhs = new FastMatrix()
    rhs: Float64Array = null

    limitMin: Float64Array = null
    limitMax: Float64Array = null

    // The constraint force vector (size dn)
    Qhat: Float64Array = null

    constraintCapacity: number = 0
    valueCapacity: number = 0

    constructor() {
        this.setConstraintCapacity(32)
        this.setValueCapacity(32)
    }

    setConstraintCapacity(capacity: number) {
        this.constraintCapacity = capacity
        this.rhs = new Float64Array(capacity)
        this.limitMin = new Float64Array(capacity)
        this.limitMax = new Float64Array(capacity)
    }

    setValueCapacity(capacity: number) {
        this.valueCapacity = capacity
        this.Qhat = new Float64Array(capacity)
    }

    solveSystem(system: ConstraintSystem) {
        let constraintCount = system.constraints.length
        let valueCount = system.valueCount

        if(constraintCount > this.constraintCapacity) {
            this.setConstraintCapacity(nextPowerOfTwo(constraintCount))
        }

        if(valueCount > this.valueCapacity) {
            this.setValueCapacity(nextPowerOfTwo(valueCount))
        }

        for (let constraint of system.constraints) {
            constraint.apply(this)
        }

        // this.lhs = JWJ^t
        // this.rhs = -J'q' − JWQ - C * k_s - Cdot * k_d

        this.lhs.clearResize(constraintCount)

        for (let i = 0; i < constraintCount; i++) {
            let constraint = system.constraints[i]
            let outputs = constraint.outputs

            // lhs:

            // Could loop over all the constraints once again, but it's unnecessary,
            // since only overlapping constraints will be accumulated.

            for (let output1 of constraint.outputs) {
                let index = output1.index
                let j1 = output1.J

                for (let output of system.getOutputsLinkedTo(index)) {
                    this.lhs.add(i, output.constraint.index, output.J * j1 / system.M[index])
                }
            }

            // rhs:

            let rhsi = 0
            let damping = 0

            for (let output of outputs) {
                rhsi -= output.Jdot * system.qdot[output.index] + output.J * system.Q[output.index] / system.M[output.index]

                // Cdot = J * qdot
                damping += output.J * system.qdot[output.index]
            }

            rhsi -= damping * system.dampingCoefficient + constraint.value * system.springCoefficient

            this.rhs[i] = rhsi
            this.limitMin[i] = constraint.limitMin
            this.limitMax[i] = constraint.limitMax
        }

        this.matrixSolver.solve(this.lhs, this.rhs, system.lambda, this.limitMin, this.limitMax)

        // Reset and calculate forces
        for(let i = 0; i < valueCount; i++) {
            this.Qhat[i] = 0
        }

        for (let i = 0; i < constraintCount; i++) {
            let lambdai = system.lambda[i]

            for (let output of system.constraints[i].outputs) {
                this.Qhat[output.index] += output.J * lambdai
            }
        }

        return this.Qhat
    }
}