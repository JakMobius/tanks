import PhysicsUtils from 'src/utils/physics-utils';
import * as Box2D from '@box2d/core';
import AirbagTankController from 'src/entity/components/tank-controllers/airbag-tank-controller';
import {physicsFilters} from "src/physics/categories";
import PhysicalComponent from "src/entity/components/physics-component";
import EntityPrefabs from "src/entity/entity-prefabs";
import TankModel from "src/entity/tanks/tank-model";
import SailingComponent from "src/entity/components/sailing-component";
import {EntityType} from "src/entity/entity-type";
import HealthComponent from "src/entity/components/health/health-component";
import {siValueFromHorsepower} from "src/utils/utils";
import TransmissionComponent from "src/entity/components/transmission/transmission-component";
import PrefabIdComponent from "src/entity/components/prefab-id-component";
import { DamageModifiers, DamageTypes } from 'src/server/damage-reason/damage-reason';

const vertices = [
    [-1.10, -1.00],
    [-1.30, -0.80],
    [-1.30, 0.80],
    [-1.10, 1.00],
    [-0.25, 1.00],
    [0.90, 0.55],
    [0.90, -0.55],
    [-0.25, -1.00],
].map(v => new Box2D.b2Vec2(v[0] * 2.25, v[1] * 2.25))

EntityPrefabs.Types.set(EntityType.TANK_NASTY, (entity) => {
    entity.addComponent(new PrefabIdComponent(EntityType.TANK_NASTY))
    TankModel.configureTank(entity)

    entity.addComponent(new SailingComponent(10000))

    // This is probably why these tanks do not exist in reality.
    // It would require a 10k horsepower engine with immense
    // maximum torque

    entity.addComponent(new TransmissionComponent())

    entity.addComponent(new AirbagTankController({
        propellers: [
            {
                x: -2.3,
                y: 1.05,
                angleSetting: 1.0,
                efficiency: 1.8, // todo: unreal
                resistance: 200.0,
                angle: 0,
                steeringAngle: -Math.PI / 4,
                momentum: 1
            }, {
                x: -2.3,
                y: -1.05,
                angleSetting: 1.0,
                efficiency: 1.8, // todo: unreal
                resistance: 200.0,
                angle: 0,
                steeringAngle: -Math.PI / 4,
                momentum: 1
            }
        ],
        engineConfig: {
            power: siValueFromHorsepower(8000),
            maxTorque: 25000,
            flywheelMomentum: 10.0
        },
        gearing: 2.5,
    }))

    entity.addComponent(new PhysicalComponent((host) => {
        let bodyFixture = PhysicsUtils.vertexFixture(vertices, {
            filter: physicsFilters.tank,
            density: 200
        })

        const body = PhysicsUtils.dynamicBody(host.world, {
            linearDamping: 0.4,
            angularDamping: 0.4
        });

        body.CreateFixture(bodyFixture)

        return body
    }))

    entity.getComponent(HealthComponent)
        .setToMaxHealth(10)
        .addDamageModifier(DamageModifiers.resistance(0.1), DamageTypes.EXPLOSION)
})
