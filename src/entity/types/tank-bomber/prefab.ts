import PhysicsUtils from 'src/utils/physics-utils';
import * as Box2D from 'src/library/box2d';
import TrackedTankController from "src/entity/components/tank-controllers/tracked-tank-controller";
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

EntityPrefabs.Types.set(EntityType.TANK_BOMBER, (entity) => {
    entity.addComponent(new PrefabIdComponent(EntityType.TANK_BOMBER))
    TankModel.configureTank(entity)
    entity.addComponent(new SailingComponent(8000))

    entity.addComponent(new TransmissionComponent())
    entity.addComponent(new TankWheelsComponent())
    entity.addComponent(new TrackedTankController({
        trackConfig: {
            length: 2.75,
            width: 1.25,
            grip: 70000,
            idleBrakingTorque: 2000,
            maxBrakingTorque: 80000,
            mass: 100,
            wheelTensionLimit: 0.01
        },
        trackGauge: 3.75,
        engineConfig: {
            power: siValueFromHorsepower(600),
            maxTorque: 600
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
        let bodyFixture = PhysicsUtils.squareFixture(1.12, 1.6875, new Box2D.Vec2(0, -0.5625), {
            filter: physicsFilters.tank,
            density: 400
        })
        let trackFixtures = PhysicsUtils.horizontalSquareFixtures(0.67, 1.6875, new Box2D.Vec2(1.805, 0), {
            filter: physicsFilters.tank,
            density: 400
        })

        const body = PhysicsUtils.dynamicBody(host.world, {
            linearDamping: 0.12,
            angularDamping: 0.12
        });

        body.CreateFixture(bodyFixture)
        for(let fixture of trackFixtures)
            body.CreateFixture(fixture)

        return body;
    }))

    entity.getComponent(HealthComponent)
        .setToMaxHealth(10)
        .addDamageModifier(DamageModifiers.resistance(0.1), DamageTypes.EXPLOSION)
})