import PhysicsUtils from 'src/utils/physics-utils';
import {physicsFilters} from "src/physics/categories";
import PhysicalComponent from "src/entity/components/physics-component";
import { EntityPrefab, EntityType } from "src/entity/entity-prefabs";
import TankModel from "src/entity/tanks/tank-model";
import SailingComponent from "src/entity/components/sailing-component";
import TankWheelsComponent from "src/entity/components/tank-wheels-component";
import {siValueFromHorsepower, siValueFromRPM} from "src/utils/utils";
import TransmissionComponent from "src/entity/components/transmission/transmission-component";
import HealthComponent from "src/entity/components/health/health-component";
import TrackedTankController from "src/entity/components/tank-controllers/tracked-tank-controller";
import TrackedSteeringAssistant from "src/entity/components/tracked-steering-assistant";
import PrefabComponent from "src/entity/components/prefab-id-component";

const Prefab = new EntityPrefab({
    id: "TANK_TESLA",
    metadata: {
        type: EntityType.tank,
        displayName: "Тесла",
    },
    prefab: (entity) => {
        entity.addComponent(new PrefabComponent(Prefab))
        TankModel.configureTank(entity)

        entity.addComponent(new SailingComponent(10000))
        entity.addComponent(new TransmissionComponent())
        entity.addComponent(new TankWheelsComponent())
        entity.addComponent(new TrackedTankController({
            trackConfig: {
                length: 3.75,
                width: 1.15,
                grip: 80000,
                maxBrakingTorque: 80000,
                idleBrakingTorque: 2000,
                mass: 100,
            },
            trackOffset: 0.5,
            trackGauge: 3.4,
            gearboxConfig: {
                gears: [
                    {high: siValueFromRPM(3500), gearing: 100},
                    {low: siValueFromRPM(2500), high: siValueFromRPM(3500), gearing: 80},
                    {low: siValueFromRPM(2500), high: siValueFromRPM(3500), gearing: 60},
                    {low: siValueFromRPM(2500), high: siValueFromRPM(3500), gearing: 40},
                ],
                clutchTorque: 2500
            },
            engineConfig: {
                torqueMap: [
                    { rpm: siValueFromRPM(0),    torque: 1000 },
                    { rpm: siValueFromRPM(5000), torque: 1000 },
                ],
                cutoffEngineSpeed: siValueFromRPM(5000),
            }
        }));

        entity.addComponent(new TrackedSteeringAssistant({

        }))

        entity.addComponent(new PhysicalComponent((host) => {
            let bodyFixture = PhysicsUtils.squareFixture(1.0125, 1.125, { x: 0, y: 0 }, {
                density: 480,
                filter: physicsFilters.tank
            })

            let trackFixtures = PhysicsUtils.horizontalSquareFixtures(2.25, 0.5625, { x: -1.6875, y: 0.45 }, {
                filter: physicsFilters.tank,
                density: 480
            })

            const body = PhysicsUtils.dynamicBody(host.world, {
                angularDamping: 0.2,
                linearDamping: 0.2
            });

            body.CreateFixture(bodyFixture)
            for (let fixture of trackFixtures)
                body.CreateFixture(fixture)

            return body
        }))

        entity.getComponent(HealthComponent)
            .setToMaxHealth(10)
    }
})

export default Prefab;