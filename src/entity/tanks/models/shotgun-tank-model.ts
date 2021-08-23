
import TankModel from '../tank-model';
import PhysicsUtils from '../../../utils/physicsutils';
import * as Box2D from '../../../library/box2d';
import TrackTankBehaviour from '../physics/track-tank/track-tank-behaviour';
import {physicsFilters} from "../../../physics/categories";

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

    initPhysics(world: Box2D.World) {

        let bodyFixture = PhysicsUtils.squareFixture(1.125, 1.0125, new Box2D.Vec2(0, -0.45), {
            filter: physicsFilters.tank
        })
        let trackFixtures = PhysicsUtils.horizontalSquareFixtures(0.5625, 2.25, new Box2D.Vec2(-0.421875, 0), {
            filter: physicsFilters.tank
        })

        const body = PhysicsUtils.dynamicBody(world);

        body.CreateFixture(bodyFixture)
        for (let fixture of trackFixtures)
            body.CreateFixture(fixture)

        this.setBody(body)
    }

    static getMaximumHealth() {
        return 10
    }
}