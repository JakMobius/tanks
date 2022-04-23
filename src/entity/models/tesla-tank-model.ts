import PhysicsUtils from '../../utils/physics-utils';
import * as Box2D from '../../library/box2d';
import BasicTankBehaviour from '../tanks/physics/track-tank/track-tank-behaviour';
import {physicsFilters} from "../../physics/categories";
import PhysicalComponent from "../components/physics-component";
import PhysicalHostComponent from "../../physiсal-world-component";
import EntityModel from "../entity-model";
import {EntityType} from "../../client/entity/client-entity";
import TankControls from "../../controls/tank-controls";

EntityModel.Types.set(EntityType.TANK_TESLA, (entity) => {
    entity.addComponent(new TankControls())
    entity.addComponent(new BasicTankBehaviour(entity, {
        engineMaxTorque: 30000,
        enginePower: 30000,
        trackConfig: {
            length: 3.75,
            grip: 30000,
            mass: 100
        },
        trackGauge: 3.75
    }))

    entity.on("attached-to-parent", (child, parent) => {
        if(child != entity) return;

        let world = parent.getComponent(PhysicalHostComponent)

        const bodyFixture = PhysicsUtils.squareFixture(1.125, 1.8, null, {
            filter: physicsFilters.tank
        })
        const trackFixtures = PhysicsUtils.horizontalSquareFixtures(0.5625, 2.25, new Box2D.Vec2(1.6875, 0), {
            filter: physicsFilters.tank
        })

        const body = PhysicsUtils.dynamicBody(world.world)
        body.CreateFixture(bodyFixture)
        for (let fixture of trackFixtures)
            body.CreateFixture(fixture)

        entity.addComponent(new PhysicalComponent(body, world))
    })
})