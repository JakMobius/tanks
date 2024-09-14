import PhysicsUtils from 'src/utils/physics-utils';
import TrackedTankController from 'src/entity/components/tank-controllers/tracked-tank-controller';
import * as Box2D from 'src/library/box2d';
import {physicsFilters} from "src/physics/categories";
import PhysicalComponent from "src/entity/components/physics-component";
import EntityPrefabs from "src/entity/entity-prefabs";
import TankModel from "src/entity/tanks/tank-model";
import SailingComponent from "src/entity/components/sailing-component";
import {EntityType} from "src/entity/entity-type";
import HealthComponent, {DamageModifiers, DamageTypes} from "src/entity/components/health-component";
import TankWheelsComponent from "src/entity/components/tank-wheels-component";
import {siValueFromHorsepower, siValueFromRPM} from "src/utils/utils";
import TransmissionComponent from "src/entity/components/transmission/transmission-component";
import TrackedSteeringAssistant from "src/entity/components/tracked-steering-assistant";
import PrefabIdComponent from "src/entity/components/prefab-id-component";

EntityPrefabs.Types.set(EntityType.TANK_MORTAR, (entity) => {
    entity.addComponent(new PrefabIdComponent(EntityType.TANK_MORTAR))
    TankModel.configureTank(entity)

    entity.addComponent(new SailingComponent(10000))

    entity.addComponent(new TransmissionComponent())
    entity.addComponent(new TankWheelsComponent())
    entity.addComponent(new TrackedTankController({
        trackConfig: {
            length: 4.5,
            width: 1.4,
            grip: 80000,
            maxBrakingTorque: 90000,
            idleBrakingTorque: 2000,
            mass: 100,
            wheelTensionLimit: 0.01
        },
        trackOffset: 0,
        trackGauge: 3.65,
        engineConfig: {
            power: siValueFromHorsepower(500),
            maxTorque: 500
        },
        gearboxConfig: {
            gears: [
                {high: siValueFromRPM(4200), gearing: 130},
                {low: siValueFromRPM(2200), high: siValueFromRPM(4200), gearing: 75},
                {low: siValueFromRPM(2200), high: siValueFromRPM(4200), gearing: 55},
                {low: siValueFromRPM(2200), high: siValueFromRPM(4200), gearing: 42},
            ],
        }
    }));

    entity.addComponent(new TrackedSteeringAssistant({

    }))

    entity.addComponent(new PhysicalComponent((host) => {
        let bodyFixture = PhysicsUtils.squareFixture(1.125, 1.8, new Box2D.Vec2(0, 0), {
            density: 480,
            filter: physicsFilters.tank
        })

        let trackFixtures = PhysicsUtils.horizontalSquareFixtures(0.7, 2.25, new Box2D.Vec2(-1.825, 0), {
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
        .addDamageModifier(DamageModifiers.resistance(0.1), DamageTypes.EXPLOSION)
})