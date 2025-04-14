import PhysicsUtils from 'src/utils/physics-utils';
import TankWheelsComponent from 'src/entity/components/tank-wheels-component';
import * as Box2D from "@box2d/core";
import { physicsFilters } from "src/physics/categories";
import WheelPositionGenerator from "src/utils/wheel-axles-generator";
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
import { TankWheelConfig, WheelGroup } from "src/entity/components/transmission/units/wheel-group";
import { DamageModifiers, DamageTypes } from 'src/server/damage-reason/damage-reason';

const Prefab = new EntityPrefab({
    id: "TANK_TINY",
    metadata: {
        type: EntityType.tank,
        displayName: "Малыш",
    },
    prefab: (entity) => {
        entity.addComponent(new PrefabComponent(Prefab))
        TankModel.configureTank(entity)
        entity.addComponent(new SailingComponent(10000))

        entity.addComponent(new TransmissionComponent())
        entity.addComponent(new TankWheelsComponent());

        const baseLength = 1.9
        const baseOffset = 0.05

        const wheelPositionGenerator = new WheelPositionGenerator()
            .setAxles(2, baseLength, baseOffset)
            .setAxleWidth(2.2)

        const frontWheelConfig: Omit<TankWheelConfig, 'x' | 'y'> = {
            tensionLimit: 0.04,
            grip: 24000,
        }

        const backWheelConfig: Omit<TankWheelConfig, 'x' | 'y'> = {
            tensionLimit: 0.04,
            grip: 17000,
        }

        const wheelGroupConfig = {
            maxBrakingTorque: 15000,
            idleBrakingTorque: 150,
            momentum: 300,
        }

        entity.addComponent(new WheeledTankController({
            minTurnRadius: 3,
            steerAnchorOffset: (-baseLength + baseOffset) / 2,
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
                    { high: siValueFromRPM(4200), gearing: 70 },
                    { low: siValueFromRPM(2500), high: siValueFromRPM(4200), gearing: 40 },
                    { low: siValueFromRPM(2500), high: siValueFromRPM(4200), gearing: 28 },
                    { low: siValueFromRPM(2500), high: siValueFromRPM(4200), gearing: 23 },
                ],
                clutchTorque: 900
            },
            wheels: [
                new WheelGroup({
                    ...wheelGroupConfig,
                    wheels: [{
                        ...frontWheelConfig,
                        ...wheelPositionGenerator.getWheelOffset(1, 0)
                    }]
                }),
                new WheelGroup({
                    ...wheelGroupConfig,
                    wheels: [{
                        ...frontWheelConfig,
                        ...wheelPositionGenerator.getWheelOffset(1, 1)
                    }]
                }),
                new WheelGroup({
                    ...wheelGroupConfig,
                    wheels: [{
                        ...backWheelConfig,
                        ...wheelPositionGenerator.getWheelOffset(0, 0)
                    }]
                }),
                new WheelGroup({
                    ...wheelGroupConfig,
                    wheels: [{
                        ...backWheelConfig,
                        ...wheelPositionGenerator.getWheelOffset(0, 1)
                    }]
                })
            ]
        }))

        const controller = entity.getComponent(WheeledTankController)
        const transmission = entity.getComponent(TransmissionComponent)
        const wheelsComponent = entity.getComponent(TankWheelsComponent)

        let gearboxOutput = controller.gearbox.outputUnitIndex
        let wheels = wheelsComponent.getWheelGroups()
        transmission.system.addConstraint(new DifferentialConstraint(gearboxOutput, wheels[2].unitIndex, wheels[3].unitIndex))
        // Uncomment to add AWD
        // transmission.system.addConstraint(new DifferentialConstraint(gearboxOutput, wheels[0].unitIndex, wheels[1].unitIndex))

        entity.addComponent(new WheeledSteeringAssistant({
            lateralMovementSteerRate: 1.9,
            angularVelocityCounterSteer: 0.2,
            criticalDriftAngle: 0.75,
            // straightenFactor: 0.1,
            steerLimitSpeed: 30,
            steerLimitFactor: 0.85,
        }))

        entity.addComponent(new PhysicalComponent((host) => {
            let bodyFixture = PhysicsUtils.squareFixture(1.2, 1, new Box2D.b2Vec2(0.13, 0), {
                density: 512,
                filter: physicsFilters.tank
            })

            const body = PhysicsUtils.dynamicBody(host.world, {
                angularDamping: 0.1,
                linearDamping: 0.1,
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
            .setToMaxHealth(6)
            .addDamageModifier(DamageModifiers.resistance(0.1), DamageTypes.EXPLOSION)
    }
})

export default Prefab;