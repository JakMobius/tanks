import TankModel from '../tank-model';
import PhysicsUtils from '../../../utils/physicsutils';
import TruckTankBehaviour from '../physics/truck-tank-behaviour';
import * as Box2D from '../../../library/box2d';
import {physicsFilters} from "../../../physics/categories";

export default class BigBoiTankModel extends TankModel<TruckTankBehaviour> {

    public static typeName = 105
    private size: number;

    constructor() {
        super();

        this.size = 9

        this.behaviour = new TruckTankBehaviour(this, {
            power: 60000,
            truckLength: this.size,
            axleWidth: this.size,
            truckFriction: 60000,
        });
    }
    static getMaximumHealth() {
        return 20
    }

    initPhysics(world: Box2D.World) {

        let bodyFixtureDef = PhysicsUtils.squareFixture(
            this.size,
            this.size * 0.87,
            null,{
                density: 3.5,
                filter: physicsFilters.tank
        })
        let trackFixtures = PhysicsUtils.horizontalSquareFixtures(
            this.size * 0.5,
            this.size,
            new Box2D.Vec2(this.size, 0), {
                density: 2,
                filter: physicsFilters.tank
        })

        const body = PhysicsUtils.dynamicBody(world, {
            linearDamping: 0.5
        });

        body.CreateFixture(bodyFixtureDef)

        for(let fixture of trackFixtures) {
            body.CreateFixture(fixture)
        }

        this.setBody(body)
    }
}