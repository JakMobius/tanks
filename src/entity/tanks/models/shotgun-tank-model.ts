
import TankModel from '../tank-model';
import PhysicsUtils from '../../../utils/physics-utils';
import * as Box2D from '../../../library/box2d';
import TrackTankBehaviour from '../physics/track-tank/track-tank-behaviour';
import {physicsFilters} from "../../../physics/categories";
import PhysicalComponent from "../../physics-component";
import PhysicalHostComponent from "../../../physiсal-world-component";

export default class ShotgunTankModel extends TankModel<TrackTankBehaviour> {

    public static typeName = 100

    constructor() {
        super();

        this.behaviour = new TrackTankBehaviour(this, {
            engineMaxTorque: 30000,
            enginePower: 30000,
            trackConfig: {
                length: 15,
                grip: 30000,
                mass: 100
            },
            trackGauge: 3.75
        });
    }

    initPhysics(world: PhysicalHostComponent) {

        let bodyFixture = PhysicsUtils.squareFixture(1.125, 1.0125, new Box2D.Vec2(0, -0.45), {
            filter: physicsFilters.tank
        })
        let trackFixtures = PhysicsUtils.horizontalSquareFixtures(0.5625, 2.25, new Box2D.Vec2(-0.421875, 0), {
            filter: physicsFilters.tank
        })

        const body = PhysicsUtils.dynamicBody(world.world);

        body.CreateFixture(bodyFixture)
        for (let fixture of trackFixtures)
            body.CreateFixture(fixture)

        this.addComponent(new PhysicalComponent(body, world))
    }

    static getMaximumHealth() {
        return 10
    }
}