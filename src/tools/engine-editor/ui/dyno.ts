import { GearConstraint } from "src/entity/components/transmission/constraints/gear-constraint"
import TransmissionComponent from "src/entity/components/transmission/transmission-component"
import GearboxUnit, { GearboxUnitConfig } from "src/entity/components/transmission/units/gearbox-unit"
import TankEngineUnit, { EngineConfig } from "src/entity/components/transmission/units/tank-engine-unit"
import TransmissionUnit from "src/entity/components/transmission/units/transmission-unit"
import { horsepowerFromSiValue, rpmFromSiValue } from "src/utils/utils"


class DynoMass extends TransmissionUnit {
    unitIndex: number
    momentum: number = 5000

    oldVelocity = 0

    onAttach(transmission: TransmissionComponent): void {
        super.onAttach(transmission)
        this.unitIndex = transmission.system.addValue(0, 0, this.momentum)
    }
}

class VirtualDynoStand {
    masses: DynoMass[] = [];

    getPower(dt: number) {
        let energy = 0
        for(let unit of this.masses) {
            let velocity = unit.transmission.system.qdot[unit.unitIndex]
            let oldEnergy = unit.momentum * unit.oldVelocity * unit.oldVelocity / 2
            let newEnergy = unit.momentum * velocity * velocity / 2
            energy += newEnergy - oldEnergy
        }
        return energy / dt
    }

    getTorque(dt: number) {
        let cumulativeTorque = 0;
        for (let unit of this.masses) {
            let angularVelocity = unit.transmission.system.qdot[unit.unitIndex];
            let angularAcceleration = (angularVelocity - unit.oldVelocity) / dt;
            cumulativeTorque += unit.momentum * angularAcceleration;
        }
        return cumulativeTorque;
    }

    getVelocity(dt: number) {
        let velocities = []
        for(let unit of this.masses) {
            velocities.push(unit.transmission.system.qdot[unit.unitIndex])
        }
        return velocities
    }

    endTick() {
        for(let unit of this.masses) {
            unit.oldVelocity = unit.transmission.system.qdot[unit.unitIndex]
        }
    }

    addUnit() {
        const unit = new DynoMass();
        this.masses.push(unit);
        return unit
    }
}

export function dyno(engineConfig: EngineConfig, gearboxConfig: GearboxUnitConfig) {
    // Create a new transmission for each dyno run to ensure fresh state
    const transmission = new TransmissionComponent()

    // For every dyno run, create a new engine with the latest config (including torque map)
    let engine = new TankEngineUnit(engineConfig)
    let gearbox = new GearboxUnit(gearboxConfig)

    transmission.addUnit(engine)
    transmission.addUnit(gearbox)
    gearbox.attachToInputUnit(engine.unitIndex)

    const dynoStand = new VirtualDynoStand();

    let unit = dynoStand.addUnit()
    transmission.addUnit(unit)
    transmission.system.addConstraint(new GearConstraint(1, unit.unitIndex, gearbox.outputUnitIndex))

    let timeLimit = 20
    let measurements = []
    let time = 0

    engine.setThrottle(1)

    while(engine.cutoffTimeLeft <= 0 && time < timeLimit) {
        const dt = 1 / 500
        transmission.onTick(dt)
        let engineUnitIndex = engine.unitIndex
        
        const angularVelocity = transmission.system.qdot[engineUnitIndex]
        const power = dynoStand.getPower(dt)
        const torque = dynoStand.getTorque(dt)

        // let calculatedTorque = 0
        // for(let unit of dynoStand.masses) {
        //     let velocity = unit.transmission.system.qdot[unit.unitIndex]
        //     if(velocity === 0) continue
        //     let oldEnergy = unit.momentum * unit.oldVelocity * unit.oldVelocity / 2
        //     let newEnergy = unit.momentum * velocity * velocity / 2
        //     let power = (newEnergy - oldEnergy) / dt
        //     let torque = power / velocity
        //     calculatedTorque += torque
        // }

        dynoStand.endTick()

        const engineTorque = engine.getTorque()
        const enginePower = engineTorque * angularVelocity

        measurements.push({ 
            time, 
            rpm: Math.max(0, rpmFromSiValue(angularVelocity)), 
            power: Math.max(0, horsepowerFromSiValue(power)),
            torque: Math.max(0, torque),
            enginePower: Math.max(0, horsepowerFromSiValue(enginePower)),
            engineTorque: Math.max(0, engineTorque),
        })

        time += dt
    }

    let length = measurements.length
    let scale = Math.ceil(length / 1000)

    if(scale > 1) {
        let newMeasurements = []
        for(let i = 0; i < length; i += scale) {
            newMeasurements.push(measurements[i])
        }
        measurements = newMeasurements
    }
    
    return measurements
}