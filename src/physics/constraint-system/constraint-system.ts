import ConstraintSystemSolver from "src/physics/constraint-system/constraint-system-solver";
import {expandTypedArray} from "src/utils/utils";

export class ConstraintSystem {

    // The external force vector
    Q: Float64Array = null

    // Particle mass vector
    M: Float64Array = null

    // The particle position vector
    q: Float64Array = null

    // The particle velocity vector
    qdot: Float64Array = null

    // Cached solution of previous iteration
    lambda: Float64Array

    springCoefficient = 0
    dampingCoefficient = 0

    constraints: Constraint[] = []
    links: ConstraintOutput[][] = []
    valueCount: number = 0

    constructor() {
        this.setConstraintCapacity(16)
        this.setValueCapacity(16)
    }

    setConstraintCapacity(capacity: number) {
        this.lambda = expandTypedArray(Float64Array, this.lambda, capacity)
    }

    setValueCapacity(capacity: number) {
        this.Q = expandTypedArray(Float64Array, this.Q, capacity)
        this.M = expandTypedArray(Float64Array, this.M, capacity)
        this.q = expandTypedArray(Float64Array, this.q, capacity)
        this.qdot = expandTypedArray(Float64Array, this.qdot, capacity)
    }

    clearForces() {
        for (let i = 0; i < this.Q.length; i++) {
            this.Q[i] = 0
        }
    }

    getOutputsLinkedTo(index: number) {
        return this.links[index]
    }

    addValue(position: number, velocity: number, mass: number) {
        if(this.valueCount >= this.Q.length) {
            this.setValueCapacity(this.valueCount * 2)
        }

        this.q[this.valueCount] = position
        this.qdot[this.valueCount] = velocity
        this.M[this.valueCount] = mass
        this.Q[this.valueCount] = 0
        this.links.push([])

        return this.valueCount++
    }

    addConstraint(constraint: Constraint) {
        this.constraints.push(constraint)

        if(this.constraints.length >= this.lambda.length) {
            this.setConstraintCapacity(this.valueCount * 2)
        }

        for (let output of constraint.outputs) {
            this.links[output.index].push(output)
        }

        constraint.index = this.constraints.length - 1
    }
}

export interface ConstraintOutput {
    constraint: Constraint
    index: number
    J: number
    Jdot: number
}

export class Constraint {
    outputs: ConstraintOutput[] = []
    value: number = 0
    index: number = -1
    limitMin: number = -Infinity
    limitMax: number = Infinity

    apply(system: ConstraintSystemSolver) {

    }

    addOutput(index: number) {
        this.outputs.push({
            index: index,
            J: 0,
            Jdot: 0,
            constraint: this
        })
    }
}