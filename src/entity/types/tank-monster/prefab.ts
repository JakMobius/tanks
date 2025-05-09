import PhysicsUtils from 'src/utils/physics-utils';
import TankWheelsComponent from 'src/entity/components/tank-wheels-component';
import { physicsFilters } from "src/physics/categories";
import PhysicalComponent from "src/entity/components/physics-component";
import { EntityPrefab, EntityType } from "src/entity/entity-prefabs";
import TankModel from "src/entity/tanks/tank-model";
import SailingComponent from "src/entity/components/sailing-component";
import HealthComponent from "src/entity/components/health/health-component";
import WheeledTankController from "src/entity/components/tank-controllers/wheeled-tank-controller";
import WheeledSteeringAssistant from "src/entity/components/wheeled-steering-assistant";
import { siValueFromHorsepower, siValueFromRPM } from "src/utils/utils";
import TransmissionComponent from "src/entity/components/transmission/transmission-component";
import DifferentialConstraint from "src/entity/components/transmission/constraints/differential-constraint";
import PrefabComponent from "src/entity/components/prefab-id-component";
import WheelPositionGenerator from "src/utils/wheel-axles-generator";
import { TankWheelConfig, TankWheelGroupConfig, WheelGroup } from "src/entity/components/transmission/units/wheel-group";
import { DamageModifiers, DamageTypes } from 'src/server/damage-reason/damage-reason';

const Prefab = new EntityPrefab({
    id: "TANK_MONSTER",
    metadata: {
        type: EntityType.tank,
        displayName: "Монстр",
    },
    prefab: (entity) => {
        entity.addComponent(new PrefabComponent(Prefab))
        TankModel.configureTank(entity)
        entity.addComponent(new SailingComponent(10000))

        entity.addComponent(new TransmissionComponent())
        entity.addComponent(new TankWheelsComponent());

        const wheelPositionGenerator = new WheelPositionGenerator()
            .setAxles(3, 1.5)
            .setAxleWidth(4)

        const wheelGroupConfig: Omit<TankWheelGroupConfig, 'wheels'> = {
            maxBrakingTorque: 30000,
            idleBrakingTorque: 6000,
            momentum: 100,
        }

        const wheelConfig: Omit<TankWheelConfig, 'x' | 'y'> = {
            grip: 45000,
            tensionLimit: 0.02
        }

        entity.addComponent(new WheeledTankController({
            engineConfig: {
                torqueMap: [
                    { rpm: siValueFromRPM(0),    torque: 600 },
                    { rpm: siValueFromRPM(5000), torque: 600 },
                ],
                cutoffEngineSpeed: siValueFromRPM(5000),
                flywheelMomentum: 0.5
            },
            gearboxConfig: {
                gears: [
                    { high: siValueFromRPM(4200), gearing: 100 },
                    { low: siValueFromRPM(2500), high: siValueFromRPM(4200), gearing: 60 },
                    { low: siValueFromRPM(2800), high: siValueFromRPM(4200), gearing: 49 },
                    { low: siValueFromRPM(3300), high: siValueFromRPM(4200), gearing: 42 },
                ],
                clutchTorque: 900
            },
            wheels: [
                new WheelGroup({
                    ...wheelGroupConfig,
                    wheels: [{
                        ...wheelConfig,
                        ...wheelPositionGenerator.getWheelOffset(0, 0)
                    }, {
                        ...wheelConfig,
                        ...wheelPositionGenerator.getWheelOffset(1, 0)
                    }, {
                        ...wheelConfig,
                        ...wheelPositionGenerator.getWheelOffset(2, 0)
                    }]
                }),
                new WheelGroup({
                    ...wheelGroupConfig,
                    wheels: [{
                        ...wheelConfig,
                        ...wheelPositionGenerator.getWheelOffset(0, 1)
                    }, {
                        ...wheelConfig,
                        ...wheelPositionGenerator.getWheelOffset(1, 1)
                    }, {
                        ...wheelConfig,
                        ...wheelPositionGenerator.getWheelOffset(2, 1)
                    }]
                })
            ]
        }))

        const controller = entity.getComponent(WheeledTankController)
        const transmission = entity.getComponent(TransmissionComponent)
        const wheelsComponent = entity.getComponent(TankWheelsComponent)

        let gearboxOutput = controller.gearbox.outputUnitIndex
        let wheels = wheelsComponent.getWheelGroups()
        transmission.system.addConstraint(new DifferentialConstraint(gearboxOutput, wheels[0].unitIndex, wheels[1].unitIndex))

        entity.addComponent(new WheeledSteeringAssistant({
            lateralMovementSteerRate: 1.9,
            angularVelocityCounterSteer: 0.1,
            criticalDriftAngle: 0.4,
            // straightenFactor: 0.1,
            steerLimitSpeed: 30,
            steerLimitFactor: 0.5,
        }))

        entity.addComponent(new PhysicalComponent((host) => {
            let bodyFixture = PhysicsUtils.squareFixture(2.5, 1.5, { x: 0, y: 0 }, {
                density: 512,
                filter: physicsFilters.tank,
            })

            const body = PhysicsUtils.dynamicBody(host.world, {
                angularDamping: 0.07,
                linearDamping: 0.07
            });

            body.CreateFixture(bodyFixture)

            const behaviour = entity.getComponent(TankWheelsComponent)

            for (let wheelGroup of behaviour.getWheelGroups()) {
                for (let wheel of wheelGroup.wheels) {
                    const fixture = PhysicsUtils.squareFixture(0.5, 0.175, { x: wheel.x, y: wheel.y }, {
                        density: 512,
                        filter: physicsFilters.tank
                    })
                    body.CreateFixture(fixture)
                }
            }

            return body;
        }))

        entity.getComponent(HealthComponent)
            .setToMaxHealth(10)
            .addDamageModifier(DamageModifiers.resistance(0.1), DamageTypes.EXPLOSION)
    }
})

export default Prefab;