
import TransmissionUnit from "src/entity/components/transmission/units/transmission-unit"
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import {ConstraintSystem} from "src/physics/constraint-system/constraint-system";
import ConstraintSystemSolver from "src/physics/constraint-system/constraint-system-solver";

export interface TransmissionComponentConfig {
    systemSpringCoefficient: number,
    systemDampingCoefficient: number
}

export default class TransmissionComponent extends EventHandlerComponent {

    units: TransmissionUnit[] = []
    system = new ConstraintSystem()

    constructor(config?: TransmissionComponentConfig) {
        super();

        config = Object.assign({
            systemSpringCoefficient: 1.0,
            systemDampingCoefficient: 100
        }, config)

        this.system.dampingCoefficient = config.systemDampingCoefficient
        this.system.springCoefficient = config.systemSpringCoefficient

        this.eventHandler.on("physics-tick", (dt) => this.onTick(dt))
    }

    onTick(dt: number): void {
        for(let unit of this.units) {
            unit.onTick(dt)
        }

        const Qhat = ConstraintSystemSolver.shared.solveSystem(this.system)

        for (let i = 0; i < this.system.qdot.length; i++) {
            this.system.qdot[i] += (this.system.Q[i] + Qhat[i]) * dt / this.system.M[i]
            this.system.q[i] += this.system.qdot[i] * dt
        }

        this.system.clearForces()
    }

    addUnit(unit: TransmissionUnit) {
        this.units.push(unit)
        unit.transmission = this
        unit.onAttach(this)
    }
}