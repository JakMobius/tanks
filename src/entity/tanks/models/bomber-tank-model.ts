import TankModel from '../tank-model';
import PhysicsUtils from '../../../utils/physicsutils';
import * as Box2D from '../../../library/box2d';
import TruckTankBehaviour from "../physics/truck-tank-behaviour";
import {physicsFilters} from "../../../physics/categories";

export default class BomberTankModel extends TankModel<TruckTankBehaviour> {

    public static typeName = 102
    public behaviour: TruckTankBehaviour

    constructor() {
        super()

        this.behaviour = new TruckTankBehaviour(this, {
            power: 30000,
            axleWidth: 7.5,
            truckLength: 15,
            truckFriction: 30000
        });
    }

    static getMaximumHealth() {
        return 20
    }

    initPhysics(world: Box2D.World) {

        let bodyFixture = PhysicsUtils.squareFixture(4.5, 6.75, new Box2D.Vec2(0, -2.25), {
            filter: physicsFilters.tank
        })
        let trackFixtures = PhysicsUtils.horizontalSquareFixtures(2.7, 6.75, new Box2D.Vec2(7.22, 0), {
            filter: physicsFilters.tank
        })

        const body = PhysicsUtils.dynamicBody(world, {
            linearDamping: 0.3
        });

        body.CreateFixture(bodyFixture)
        for(let fixture of trackFixtures)
            body.CreateFixture(fixture)

        this.setBody(body)
    }
}