import TankModel from '../tank-model';
import PhysicsUtils from '../../../utils/physicsutils';
import TrackTankBehaviour from '../physics/track-tank/track-tank-behaviour';
import * as Box2D from '../../../library/box2d';
import {physicsFilters} from "../../../physics/categories";

export default class BigBoiTankModel extends TankModel<TrackTankBehaviour> {

    public static typeName = 105

    constructor() {
        super();

        this.behaviour = new TrackTankBehaviour(this, {
            enginePower: 2000000,    // 2 mW = 2682 horsepower
            engineMaxTorque: 600000, // 600 kN = 61.22 T
            trackConfig: {
                length: 3.75,
                width: 2.25,
                grip: 300000,
                maxBrakingTorque: 240000,
                idleBrakingTorque: 50000,
                mass: 100
            },
            trackGauge: 4.5
        });
    }
    static getMaximumHealth() {
        return 20
    }

    initPhysics(world: Box2D.World) {

        let bodyFixtureDef = PhysicsUtils.squareFixture(2.25, 1.9575, null, {
            density: 1920,
            filter: physicsFilters.tank
        })
        let trackFixtures = PhysicsUtils.horizontalSquareFixtures(1.125, 2.25, new Box2D.Vec2(2.25, 0), {
            density: 1920,
            filter: physicsFilters.tank
        })

        const body = PhysicsUtils.dynamicBody(world, {
            angularDamping: 0.1,
            linearDamping: 0.2
        });

        body.CreateFixture(bodyFixtureDef)

        for(let fixture of trackFixtures) {
            body.CreateFixture(fixture)
        }

        this.setBody(body)
    }
}