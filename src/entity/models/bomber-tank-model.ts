import PhysicsUtils from '../../utils/physics-utils';
import * as Box2D from '../../library/box2d';
import TrackTankBehaviour from "../tanks/physics/track-tank/track-tank-behaviour";
import {physicsFilters} from "../../physics/categories";
import PhysicalComponent from "../components/physics-component";
import PhysicalHostComponent from "../../physiсal-world-component";
import EntityModel from "../entity-model";
import {EntityType} from "../../client/entity/client-entity";
import TankControls from "../../controls/tank-controls";

EntityModel.Types.set(EntityType.TANK_BOMBER, (entity) => {
    entity.addComponent(new TankControls())
    entity.addComponent(new TrackTankBehaviour({
        enginePower: 600000, // 0.6 mW = 804.6 horsepower
        engineMaxTorque: 100000,
        trackConfig: {
            length: 2.75,
            width: 1.25,
            grip: 50000,
            idleBrakingTorque: 7000,
            maxBrakingTorque: 60000,
            mass: 100
        },
        trackGauge: 3.75
    }));

    entity.addComponent(new PhysicalComponent((host) => {
        let bodyFixture = PhysicsUtils.squareFixture(1.125, 1.6875, new Box2D.Vec2(0, -0.5625), {
            filter: physicsFilters.tank,
            density: 400
        })
        let trackFixtures = PhysicsUtils.horizontalSquareFixtures(0.675, 1.6875, new Box2D.Vec2(1.805, 0), {
            filter: physicsFilters.tank,
            density: 400
        })

        const body = PhysicsUtils.dynamicBody(host.world, {
            linearDamping: 0.3
        });

        body.CreateFixture(bodyFixture)
        for(let fixture of trackFixtures)
            body.CreateFixture(fixture)

        return body;
    }))
})