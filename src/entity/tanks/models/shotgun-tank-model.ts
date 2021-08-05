
import TankModel from '../tank-model';
import PhysicsUtils from '../../../utils/physicsutils';
import * as Box2D from '../../../library/box2d';
import TruckTankBehaviour from '../physics/truck-tank-behaviour';
import {physicsFilters} from "../../../physics/categories";

export default class ShotgunTankModel extends TankModel<TruckTankBehaviour> {

    public static typeName = 100

    constructor() {
        super();

        this.behaviour = new TruckTankBehaviour(this, {
            power: 20000,
        });
    }

    initPhysics(world: Box2D.World) {

        let size = 9
        const segment = size / 4;

        let bodyFixture = PhysicsUtils.squareFixture(size / 2, size * 0.45, new Box2D.Vec2(0, -size * 0.2), {
            filter: physicsFilters.tank
        })
        let trackFixtures = PhysicsUtils.horizontalSquareFixtures(segment, size, new Box2D.Vec2(-size / 2 - segment, 0), {
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