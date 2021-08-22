import TankModel from '../tank-model';
import PhysicsUtils from '../../../utils/physicsutils';
import TrackTankBehaviour from '../physics/track-tank-behaviour';
import * as Box2D from '../../../library/box2d';
import {physicsFilters} from "../../../physics/categories";

export default class SniperTankModel extends TankModel<TrackTankBehaviour> {

    public static typeName = 101

    constructor() {
        super();

        this.behaviour = new TrackTankBehaviour(this, {
            enginePower: 11000000,
            engineMaxTorque: 10000000,
            trackLength: 15,
            trackGrip: 500000,
            trackMaxBrakingTorque: 50000000,
            trackIdleBrakingTorque: 100000,
            wheelTensionLimit: 0.09,
            axlesOffset: 2,
            axleWidth: 7
        });
    }

    initPhysics(world: Box2D.World) {

        // Sniper is a tank. Tank should be massive

        let bodyFixture = PhysicsUtils.squareFixture(4.5, 4.05, new Box2D.Vec2(0, 0), {
            density: 30,
            filter: physicsFilters.tank
        })
        let trackFixtures = PhysicsUtils.horizontalSquareFixtures(2.25, 9, new Box2D.Vec2(-6.75, 1.8), {
            filter: physicsFilters.tank,
            density: 30
        })

        const body = PhysicsUtils.dynamicBody(world, {
            angularDamping: 0.2,
            linearDamping: 0.2
        });

        body.CreateFixture(bodyFixture)
        for (let fixture of trackFixtures)
            body.CreateFixture(fixture)

        this.setBody(body)
    }

    static getMaximumHealth() {
        return 10
    }
}