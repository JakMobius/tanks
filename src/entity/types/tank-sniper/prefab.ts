import PhysicsUtils from 'src/utils/physics-utils';
import TrackedTankController from 'src/entity/components/tank-controllers/tracked-tank-controller';
import * as Box2D from '@box2d/core';
import {physicsFilters} from "src/physics/categories";
import PhysicalComponent from "src/entity/components/physics-component";
import EntityPrefabs from "src/entity/entity-prefabs";
import TankModel from "src/entity/tanks/tank-model";
import SailingComponent from "src/entity/components/sailing-component";
import {EntityType} from "src/entity/entity-type";
import HealthComponent from "src/entity/components/health-component";
import TankWheelsComponent from "src/entity/components/tank-wheels-component";
import {siValueFromHorsepower, siValueFromRPM} from "src/utils/utils";
import TransmissionComponent from "src/entity/components/transmission/transmission-component";
import TrackedSteeringAssistant from "src/entity/components/tracked-steering-assistant";
import PrefabIdComponent from "src/entity/components/prefab-id-component";
import { DamageModifiers, DamageTypes } from 'src/server/damage-reason/damage-reason';

EntityPrefabs.Types.set(EntityType.TANK_SNIPER, (entity) => {
    entity.addComponent(new PrefabIdComponent(EntityType.TANK_SNIPER))
    TankModel.configureTank(entity)

    entity.addComponent(new SailingComponent(10000))
    entity.addComponent(new TransmissionComponent())
    entity.addComponent(new TankWheelsComponent())
    entity.addComponent(new TrackedTankController({
        trackConfig: {
            length: 3.75,
            width: 1.15,
            grip: 65000,
            maxBrakingTorque: 80000,
            idleBrakingTorque: 2000,
            mass: 1000,
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
            clutchTorque: 900
        },
        engineConfig: {
            power: siValueFromHorsepower(600),
            maxTorque: 600,
            flywheelMomentum: 0.5
        }
    }));

    entity.addComponent(new TrackedSteeringAssistant({

    }))

    entity.addComponent(new PhysicalComponent((host) => {
        let bodyFixture = PhysicsUtils.squareFixture(1.125, 1.0125, new Box2D.b2Vec2(0, 0), {
            density: 680,
            filter: physicsFilters.tank,
            restitution: 0.05
        })

        let trackFixtures = PhysicsUtils.horizontalSquareFixtures(0.5625, 2.25, new Box2D.b2Vec2(-1.6875, 0.45), {
            filter: physicsFilters.tank,
            density: 680,
            restitution: 0.05
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
        .addDamageModifier(DamageModifiers.resistance(0.1), DamageTypes.EXPLOSION)
})