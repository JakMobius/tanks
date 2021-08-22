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
            power: 35000000,
            maxTorque: 5000000,
            wheelSlideFriction: 350000,
            wheelTensionLimit: 0.1,
            wheelMass: 100,
            brakeTorque: 1000000
        });
    }

    static getMaximumHealth() {
        return 10
    }

    initPhysics(world: b2World) {
        let size = 10

        let bodyFixture = PhysicsUtils.squareFixture(6, 10, new Vec2(), {
            density: 40,
            filter: physicsFilters.tank
        })

        const body = PhysicsUtils.dynamicBody(world, {
            angularDamping: 0.8,
            linearDamping: 0.8
        });

        body.CreateFixture(bodyFixture)

        for (let axleOffset of this.behaviour.axleOffsetList) {
            const pair = PhysicsUtils.horizontalSquareFixtures(0.7, 2, new Vec2(this.behaviour.axleWidth, axleOffset), {
                density: 40,
                filter: physicsFilters.tank
            })
            for(let wheel of pair) {
                body.CreateFixture(wheel)
            }
        }

        this.setBody(body)
    }
}
