import PhysicsUtils from '../../utils/physics-utils';
import * as Box2D from '../../library/box2d';
import BasicTankBehaviour from '../tanks/physics/track-tank/track-tank-behaviour';
import {physicsFilters} from "src/physics/categories";
import PhysicalComponent from "../components/physics-component";
import EntityPrefabs from "../entity-prefabs";
import TankModel from "../tanks/tank-model";
import SailingComponent from "../components/sailing-component";
import {EntityType} from "../entity-type";

EntityPrefabs.Types.set(EntityType.TANK_TESLA, (entity) => {
    TankModel.initializeEntity(entity)

    entity.addComponent(new SailingComponent(10000))

    entity.addComponent(new BasicTankBehaviour({
        engineMaxTorque: 30000,
        enginePower: 30000,
        trackConfig: {
            length: 3.75,
            grip: 30000,
            mass: 100
        },
        trackGauge: 3.75
    }))

    entity.addComponent(new PhysicalComponent((host) => {
        const bodyFixture = PhysicsUtils.squareFixture(1.125, 1.8, null, {
            filter: physicsFilters.tank
        })
        const trackFixtures = PhysicsUtils.horizontalSquareFixtures(0.5625, 2.25, new Box2D.Vec2(1.6875, 0), {
            filter: physicsFilters.tank
        })

        const body = PhysicsUtils.dynamicBody(host.world)
        body.CreateFixture(bodyFixture)
        for (let fixture of trackFixtures)
            body.CreateFixture(fixture)

        return body
    }))
})