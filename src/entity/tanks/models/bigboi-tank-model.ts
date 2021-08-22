import TankModel from '../tank-model';
import PhysicsUtils from '../../../utils/physicsutils';
import TrackTankBehaviour from '../physics/track-tank-behaviour';
import * as Box2D from '../../../library/box2d';
import {physicsFilters} from "../../../physics/categories";

export default class BigBoiTankModel extends TankModel<TrackTankBehaviour> {

    public static typeName = 105
    private size: number;

    constructor() {
        super();

        this.size = 9

        this.behaviour = new TrackTankBehaviour(this, {
            power: 18000000,
            truckLength: 15,
            axleWidth: 9,
            truckFriction: 1000000,
            maxTorque: 10000000,
            brakeTorque: 1000000,
            wheelTensionLimit: 0.05
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
        let trackFixtures = PhysicsUtils.horizontalSquareFixtures(4.5, 9,
            new Box2D.Vec2(9, 0), {
            density: 60,
            filter: physicsFilters.tank
        })

        const body = PhysicsUtils.dynamicBody(world, {
            angularDamping: 2,
            linearDamping: 2
        });

        body.CreateFixture(bodyFixtureDef)

        for(let fixture of trackFixtures) {
            body.CreateFixture(fixture)
        }

        this.setBody(body)
    }
}