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
            power: 11000000,
            axleWidth: 7,
            truckLength: 15,
            truckFriction: 500000,
            maxTorque: 10000000,
            brakeTorque: 1000000,
            wheelTensionLimit: 0.09,
            axlesOffset: 2
        });
    }

    initPhysics(world: Box2D.World) {

        let size = 9
        const segment = size / 4;

        // Sniper is a tank. Tank should be massive

        let bodyFixture = PhysicsUtils.squareFixture(4.5, 4.05, new Box2D.Vec2(0, 0), {
            density: 30,
            filter: physicsFilters.tank
        })
        let trackFixtures = PhysicsUtils.horizontalSquareFixtures(2.25, 9, new Box2D.Vec2(-size / 2 - segment, size * 0.2), {
            filter: physicsFilters.tank,
            density: 30
        })

        const body = PhysicsUtils.dynamicBody(world, {
            angularDamping: 0.8,
            linearDamping: 0.8
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