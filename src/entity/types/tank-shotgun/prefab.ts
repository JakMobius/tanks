import PhysicsUtils from 'src/utils/physics-utils';
import * as Box2D from '@box2d/core';
import TrackedTankController from 'src/entity/components/tank-controllers/tracked-tank-controller';
import {physicsFilters} from "src/physics/categories";
import PhysicalComponent from "src/entity/components/physics-component";
import EntityPrefabs from "src/entity/entity-prefabs";
import TankModel from "src/entity/tanks/tank-model";
import SailingComponent from "src/entity/components/sailing-component";
import {EntityType} from "src/entity/entity-type";
import TankWheelsComponent from "src/entity/components/tank-wheels-component";
import {siValueFromHorsepower, siValueFromRPM} from "src/utils/utils";
import TransmissionComponent from "src/entity/components/transmission/transmission-component";
import HealthComponent from "src/entity/components/health/health-component";
import TrackedSteeringAssistant from "src/entity/components/tracked-steering-assistant";
import PrefabIdComponent from "src/entity/components/prefab-id-component";

EntityPrefabs.Types.set(EntityType.TANK_SHOTGUN, (entity) => {
    entity.addComponent(new PrefabIdComponent(EntityType.TANK_SHOTGUN))
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
            wheelTensionLimit: 0.01
        },
        trackOffset: 0.5,
        trackGauge: 3.4,
        gearboxConfig: {
            gears: [
                {high: siValueFromRPM(4200), gearing: 130},
                {low: siValueFromRPM(2200), high: siValueFromRPM(4200), gearing: 75},
                {low: siValueFromRPM(2200), high: siValueFromRPM(4200), gearing: 55},
                {low: siValueFromRPM(2200), high: siValueFromRPM(4200), gearing: 42},
            ],
            clutchTorque: 1500
        },
        engineConfig: {
            power: siValueFromHorsepower(1000),
            maxTorque: 1000
        }
    }));

    entity.addComponent(new TrackedSteeringAssistant({

    }))

    entity.addComponent(new PhysicalComponent((host) => {
        let bodyFixture = PhysicsUtils.squareFixture(1.0125, 1.125, { x: 0, y: 0 }, {
            density: 480,
            filter: physicsFilters.tank
        })

        let trackFixtures = PhysicsUtils.horizontalSquareFixtures(2.25, 0.5625, { x: 0.45, y: -1.6875 }, {
            filter: physicsFilters.tank,
            density: 480
        })

        const body = PhysicsUtils.dynamicBody(host.world, {
            angularDamping: 0.12,
            linearDamping: 0.12
        });

        body.CreateFixture(bodyFixture)
        for (let fixture of trackFixtures)
            body.CreateFixture(fixture)

        return body
    }))

    entity.getComponent(HealthComponent)
        .setToMaxHealth(10)
})