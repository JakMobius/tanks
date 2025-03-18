import PhysicalComponent from "src/entity/components/physics-component";
import TankControls from "src/controls/tank-controls";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import * as Box2D from '@box2d/core'
import Entity from "src/utils/ecs/entity";
import TransmissionComponent from "src/entity/components/transmission/transmission-component";
import {AirbagPropeller, AirbagPropellerConfig} from "src/entity/components/transmission/units/airbag-propeller";
import TankEngineUnit, {EngineConfig} from "src/entity/components/transmission/units/tank-engine-unit";
import {GearConstraint} from "src/entity/components/transmission/constraints/gear-constraint";

export interface AirbagBehaviourConfig {
    propellers: AirbagPropellerConfig[]
    gearing: number
    engineConfig: EngineConfig
}

export default class AirbagTankController extends EventHandlerComponent {
    public propellers: AirbagPropeller[] = []
    public config: AirbagBehaviourConfig
    public engine: TankEngineUnit

    constructor(config: AirbagBehaviourConfig) {
        super()

        this.config = config

        for (let propellerConfig of config.propellers) {
            this.propellers.push(new AirbagPropeller(propellerConfig))
        }

        this.eventHandler.on("death", () => this.engine.setEnabled(false))
        this.eventHandler.on("physics-tick", (dt) => this.onTick(dt))
    }

    onAttach(entity: Entity) {
        super.onAttach(entity);

        this.configureTransmission()
    }

    configureTransmission() {
        const transmissionComponent = this.entity.getComponent(TransmissionComponent)

        this.engine = new TankEngineUnit(this.config.engineConfig)
        transmissionComponent.addUnit(this.engine)

        for(let propeller of this.propellers) {
            transmissionComponent.addUnit(propeller)

            // Link the propeller and the engine together
            let gear = new GearConstraint(this.config.gearing, propeller.unitIndex, this.engine.unitIndex)
            transmissionComponent.system.addConstraint(gear)
        }
    }

    onDetach() {
        // Well, this component is not meant to be detached from a tank.
        // This is not a trivial task.
        super.onDetach();
    }

    onTick(dt: number) {
        const controlsComponent = this.entity.getComponent(TankControls)
        const transmissionComponent = this.entity.getComponent(TransmissionComponent)

        if (!transmissionComponent || !controlsComponent) {
            return
        }

        const body = this.entity.getComponent(PhysicalComponent).getBody();
        const steer = -controlsComponent.getSteer()

        const propellerAOA = controlsComponent.getThrottle()

        const propellerForward = {x: 0, y: 0}
        const steerVector = {x: 0, y: 0}
        const propellerCenter = {x: 0, y: 0}

        let totalForce = 0
        let totalPower = 0
        let totalTorque = 0
        let airspeed = 0

        for (let propeller of this.propellers) {

            propeller.setRuderAngle(steer * propeller.steeringAngle)

            body.GetWorldVector(propeller.getDirection(), propellerForward)
            body.GetWorldVector(propeller.getRuderDirection(), steerVector)

            Box2D.b2Vec2.prototype.Scale.call(propellerForward, propellerAOA)
            Box2D.b2Vec2.prototype.Scale.call(steerVector, propellerAOA)

            const forwardAirspeed = Box2D.b2Vec2.Dot(body.GetLinearVelocity(), propellerForward)

            const propellerSpeed = transmissionComponent.system.qdot[propeller.unitIndex]
            const propellerOutputAirspeed = propellerSpeed * propeller.angleSetting

            const windmillDifference = propellerOutputAirspeed - forwardAirspeed

            const propellerForce = propeller.resistance * windmillDifference
            const propellerTorque = propellerForce * propeller.angleSetting / propeller.efficiency

            totalForce += propellerForce
            totalPower += propellerSpeed * propellerTorque
            totalTorque += propellerTorque
            airspeed = windmillDifference

            Box2D.b2Vec2.prototype.Scale.call(steerVector, propellerForce)

            body.GetWorldPoint(propeller.position, propellerCenter)
            body.ApplyForce(steerVector, propellerCenter)

            transmissionComponent.system.Q[propeller.unitIndex] -= propellerTorque
        }

        this.engine.setThrottle(Math.abs(controlsComponent.getThrottle()))

        // if(Math.random() > 0.97) {
        //     let enginePower = engineComponent.flywheel.getRotationSpeed() * engineComponent.flywheel.getTorque()
        //     let engineTorque = engineComponent.flywheel.getTorque()
        //     console.log("f: " + totalForce + ", spd: " + airspeed + ", pwr = " + horsepowerFromSiValue(enginePower) + ", trq = " + engineTorque + ", rpm: " + rpmFromSiValue(engineComponent.flywheel.getRotationSpeed()))
        // }
    }
}