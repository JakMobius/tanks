import TankModel from '../tank-model';
import PhysicsUtils from '../../../utils/physicsutils';
import TruckTankBehaviour from '../physics/truck-tank-behaviour';
import * as Box2D from '../../../library/box2d';
import {physicsFilters} from "../../../physics/categories";

export default class SniperTankModel extends TankModel<TruckTankBehaviour> {

    public static typeName = 101

    constructor() {
        super();

        this.behaviour = new TruckTankBehaviour(this, {
            power: 50000,
            axleWidth: 7.5,
            truckLength: 15,
            truckFriction: 30000
        });
    }

    initPhysics(world: Box2D.World) {

        let size = 9
        const segment = size / 4;

        // Sniper is a tank. Tank should be massive

        let bodyFixture = PhysicsUtils.squareFixture(size / 2, size * 0.45, new Box2D.Vec2(0, 0), {
            density: 3,
            filter: physicsFilters.tank
        })
        let trackFixtures = PhysicsUtils.horizontalSquareFixtures(segment, size, new Box2D.Vec2(-size / 2 - segment, size * 0.2), {
            filter: physicsFilters.tank
        })

        const body = PhysicsUtils.dynamicBody(world, {
            angularDamping: 1.0,
            linearDamping: 0.5
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