import PhysicsUtils from 'src/utils/physics-utils';
import TrackedTankController from 'src/entity/components/tank-controllers/tracked-tank-controller';
import { physicsFilters } from "src/physics/categories";
import PhysicalComponent from "src/entity/components/physics-component";
import { EntityPrefab, EntityType } from "src/entity/entity-prefabs";
import TankModel from "src/entity/tanks/tank-model";
import SailingComponent from "src/entity/components/sailing-component";
import HealthComponent from "src/entity/components/health/health-component";
import TankWheelsComponent from "src/entity/components/tank-wheels-component";
import { siValueFromHorsepower, siValueFromRPM } from "src/utils/utils";
import TransmissionComponent from "src/entity/components/transmission/transmission-component";
import TrackedSteeringAssistant from "src/entity/components/tracked-steering-assistant";
import PrefabComponent from "src/entity/components/prefab-id-component";
import { DamageModifiers, DamageTypes } from 'src/server/damage-reason/damage-reason';

const Prefab = new EntityPrefab({
    id: "TANK_BIGBOI",
    metadata: {
        type: EntityType.tank,
        displayName: "Big Boi"
    },
    prefab: (entity) => {
        entity.addComponent(new PrefabComponent(Prefab))
        TankModel.configureTank(entity)
        entity.addComponent(new SailingComponent(12000))

        entity.addComponent(new TransmissionComponent({
            systemDampingCoefficient: 1000,
            systemSpringCoefficient: 3.0
        }))
        entity.addComponent(new TankWheelsComponent())
        entity.addComponent(new TrackedTankController({
            trackConfig: {
                length: 4.5,
                width: 2.3,
                grip: 300000,
                maxBrakingTorque: 300000,
                idleBrakingTorque: 3000,
                mass: 3000,
                wheelTensionLimit: 0.01
            },
            trackOffset: 0,
            trackGauge: 4.42,
            engineConfig: {
                torqueMap: [
                    { rpm: siValueFromRPM(0),    torque: 2000 },
                    { rpm: siValueFromRPM(5000), torque: 2000 },
                ],
                cutoffEngineSpeed: siValueFromRPM(5000),
                flywheelMomentum: 2.5,
            },
            gearboxConfig: {
                clutchStrokeLow: siValueFromRPM(900),
                clutchStrokeHigh: siValueFromRPM(1100),
                gears: [
                    { high: siValueFromRPM(4000), gearing: 230 },
                    { low: siValueFromRPM(2200), high: siValueFromRPM(4000), gearing: 150 },
                    { low: siValueFromRPM(2200), high: siValueFromRPM(4000), gearing: 120 },
                    { low: siValueFromRPM(2200), high: siValueFromRPM(4000), gearing: 90 },
                ],
                clutchTorque: 2600
            }
        }));

        entity.addComponent(new TrackedSteeringAssistant({
            maxRadPerSecond: 4,
        }))

        entity.addComponent(new PhysicalComponent((host) => {
            let bodyFixtureDef = PhysicsUtils.squareFixture(1.9575, 2.25, null, {
                density: 1344,
                filter: physicsFilters.tank
            })
            let trackFixtures = PhysicsUtils.horizontalSquareFixtures(2.25, 1.125, { x: 0, y: 2.25 }, {
                density: 1344,
                filter: physicsFilters.tank
            })

            const body = PhysicsUtils.dynamicBody(host.world, {
                angularDamping: 0.2,
                linearDamping: 0.2
            });

            body.CreateFixture(bodyFixtureDef)
            for (let fixture of trackFixtures)
                body.CreateFixture(fixture)

            return body
        }))

        entity.getComponent(HealthComponent)
            .setToMaxHealth(10)
            .addDamageModifier(DamageModifiers.resistance(0.3), DamageTypes.EXPLOSION)
    }
})

export default Prefab;