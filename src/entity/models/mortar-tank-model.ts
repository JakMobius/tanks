import PhysicsUtils from '../../utils/physics-utils';
import TrackTankBehaviour from '../tanks/physics/track-tank/track-tank-behaviour';
import * as Box2D from '../../library/box2d';
import {physicsFilters} from "../../physics/categories";
import PhysicalComponent from "../components/physics-component";
import EntityModel from "../entity-model";
import TankModel from "../tanks/tank-model";
import SailingComponent from "../components/sailing-component";
import {EntityType} from "../entity-type";

EntityModel.Types.set(EntityType.TANK_MORTAR, (entity) => {
    TankModel.initializeEntity(entity)
    entity.addComponent(new SailingComponent(10000))

    entity.addComponent(new TrackTankBehaviour({
        engineMaxTorque: 30000,
        enginePower: 30000,
        trackConfig: {
            length: 15,
            grip: 30000,
            mass: 100
        },
        trackGauge: 15
    }));

    entity.addComponent(new PhysicalComponent((host) => {
        let size = 9
        const segment = size / 4;

        let bodyFixture = PhysicsUtils.squareFixture(1.125, 1.8, new Box2D.Vec2(0, 0), {
            filter: physicsFilters.tank,
            density: 600
        })

        let trackFixtures = PhysicsUtils.horizontalSquareFixtures(segment, size, new Box2D.Vec2(-1.6875, 0), {
            filter: physicsFilters.tank,
            density: 600
        })

        const body = PhysicsUtils.dynamicBody(host.world);

        body.CreateFixture(bodyFixture)
        for (let fixture of trackFixtures)
            body.CreateFixture(fixture)

        return body;
    }))
})