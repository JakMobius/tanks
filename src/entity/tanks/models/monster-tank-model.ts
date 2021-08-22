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
            enginePower: 12000000,
            engineMaxTorque: 5000000,
            wheelGrip: 350000,
            wheelTensionLimit: 0.1,
            wheelMass: 100,
            maxWheelBrakingTorque: 166600,
            idleWheelBrakingTorque: 15000
        });
    }

    static getMaximumHealth() {
        return 10
    }

    initPhysics(world: b2World) {

        let bodyFixture = PhysicsUtils.squareFixture(6, 10, new Vec2(), {
            density: 40,
            filter: physicsFilters.tank
        })

        const body = PhysicsUtils.dynamicBody(world, {
            angularDamping: 0.1,
            linearDamping: 0.1
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
