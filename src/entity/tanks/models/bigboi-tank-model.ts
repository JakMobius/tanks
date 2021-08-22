import TankModel from '../tank-model';
import PhysicsUtils from '../../../utils/physicsutils';
import TrackTankBehaviour from '../physics/track-tank-behaviour';
import * as Box2D from '../../../library/box2d';
import {physicsFilters} from "../../../physics/categories";

export default class BigBoiTankModel extends TankModel<TrackTankBehaviour> {

    public static typeName = 105

    constructor() {
        super();

        this.behaviour = new TrackTankBehaviour(this, {
            enginePower: 18000000,
            engineMaxTorque: 10000000,
            trackLength: 15,
            trackGrip: 1200000,
            trackMaxBrakingTorque: 5000000,
            trackIdleBrakingTorque: 300000,
            wheelTensionLimit: 0.05,
            axleWidth: 9
        });
    }
    static getMaximumHealth() {
        return 20
    }

    initPhysics(world: Box2D.World) {

        let bodyFixtureDef = PhysicsUtils.squareFixture(9, 7.83, null, {
            density: 60,
            filter: physicsFilters.tank
        })
        let trackFixtures = PhysicsUtils.horizontalSquareFixtures(4.5, 9, new Box2D.Vec2(9, 0), {
            density: 60,
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