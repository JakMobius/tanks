
import PhysicsUtils from '../../../utils/physics-utils';
import TrackTankBehaviour from '../physics/track-tank/track-tank-behaviour';
import * as Box2D from '../../../library/box2d';
import {physicsFilters} from "../../../physics/categories";
import PhysicalComponent from "../../components/physics-component";
import EntityModel from "../../entity-model";
import {EntityType} from "../../../client/entity/client-entity";
import TankControls from "../../../controls/tank-controls";
import PhysicalHostComponent from "../../../physiсal-world-component";

EntityModel.Types.set(EntityType.TANK_SNIPER, (entity) => {
    entity.addComponent(new TankControls())
    entity.addComponent(new TrackTankBehaviour(entity, {
        enginePower: 900000,     // 0.9 mW = 1206 horsepower
        engineMaxTorque: 200000, // 200 kN ~ 20 T
        trackConfig: {
            length: 3.75,
            width: 1.15,
            grip: 80000,
            maxBrakingTorque: 90000,
            idleBrakingTorque: 10000,
            mass: 100,
        },
        trackOffset: 0.5,
        trackGauge: 3.4
    }));

    entity.on("attached-to-parent", (child, parent) => {
        if(child != entity) return;

        let bodyFixture = PhysicsUtils.squareFixture(1.125, 1.0125, new Box2D.Vec2(0, 0), {
            density: 480,
            filter: physicsFilters.tank
        })

        let trackFixtures = PhysicsUtils.horizontalSquareFixtures(0.5625, 2.25, new Box2D.Vec2(-1.6875, 0.45), {
            filter: physicsFilters.tank,
            density: 480
        })

        let worldComponent = parent.getComponent(PhysicalHostComponent)

        const body = PhysicsUtils.dynamicBody(worldComponent.world, {
            angularDamping: 0.2,
            linearDamping: 0.2
        });

        body.CreateFixture(bodyFixture)
        for (let fixture of trackFixtures)
            body.CreateFixture(fixture)

        entity.addComponent(new PhysicalComponent(body, worldComponent))
    })
})