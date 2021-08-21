import TankModel from '../tank-model';
import PhysicsUtils from '../../../utils/physicsutils';
import WheeledTankBehaviour from '../physics/wheeled-tank-behaviour';
import {b2World} from "../../../library/box2d/dynamics/b2_world";
import {Vec2} from "../../../library/box2d";
import {physicsFilters} from "../../../physics/categories";

export default class MonsterTankModel extends TankModel<WheeledTankBehaviour> {

    public static typeName = 103

    constructor() {
        super()

        this.behaviour = new WheeledTankBehaviour(this, {
            power: 11000000,
            maxTorque: 10000000
        });
    }

    static getMaximumHealth() {
        return 10
    }

    initPhysics(world: b2World) {
        let size = 10

        let bodyFixture = PhysicsUtils.squareFixture(size * 0.6, size, new Vec2(), {
            density: 50,
            filter: physicsFilters.tank
        })

        const body = PhysicsUtils.dynamicBody(world, {
            linearDamping: 0.1,
        });

        body.CreateFixture(bodyFixture)

        for (let axleOffset of this.behaviour.axleOffsetList) {
            const pair = PhysicsUtils.horizontalSquareFixtures(size * 0.07, size * 0.2, new Vec2(this.behaviour.axleWidth, axleOffset), {
                density: 30,
                filter: physicsFilters.tank
            })
            for(let wheel of pair) {
                body.CreateFixture(wheel)
            }
        }

        this.setBody(body)
    }
}
