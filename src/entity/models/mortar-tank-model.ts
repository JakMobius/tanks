import PhysicsUtils from '../../utils/physics-utils';
import TrackTankBehaviour from '../tanks/physics/track-tank/track-tank-behaviour';
import * as Box2D from '../../library/box2d';
import {physicsFilters} from "../../physics/categories";
import PhysicalComponent from "../components/physics-component";
import PhysicalHostComponent from "../../physiсal-world-component";
import EntityModel from "../entity-model";
import {EntityType} from "../../client/entity/client-entity";
import TankControls from "../../controls/tank-controls";
import {Vec2} from "../../library/box2d";
import WheeledTankBehaviour from "../tanks/physics/wheeled-tank/wheeled-tank-behaviour";

EntityModel.Types.set(EntityType.TANK_MORTAR, (entity) => {
    entity.addComponent(new TankControls())
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