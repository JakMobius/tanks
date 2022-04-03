import TankModel from '../tank-model';
import PhysicsUtils from '../../../utils/physics-utils';
import WheeledTankBehaviour from '../physics/wheeled-tank/wheeled-tank-behaviour';
import {b2World} from "../../../library/box2d/dynamics/b2_world";
import {Vec2} from "../../../library/box2d";
import {physicsFilters} from "../../../physics/categories";
import WheelAxlesGenerator from "../physics/wheeled-tank/wheel-axles-generator";
import PhysicalComponent from "../../physics-component";
import PhysicalHostComponent from "../../../physics-world";

export default class MonsterTankModel extends TankModel<WheeledTankBehaviour> {

    public static typeName = 103

    constructor() {
        super()

        this.behaviour = new WheeledTankBehaviour(this, {
            enginePower: 900000,
            engineMaxTorque: 200000,
            wheels: WheelAxlesGenerator.generateWheels({
                wheelConfig: {
                    grip: 45000,
                    maxBrakingTorque: 45000,
                    idleBrakingTorque: 5000,
                    mass: 100,
                },
                axles: 3,
                axleDistance: 1.5,
                axleWidth: 2
            })
        });
    }

    static getMaximumHealth() {
        return 10
    }

    initPhysics(world: PhysicalHostComponent) {

        let bodyFixture = PhysicsUtils.squareFixture(1.5, 2.5, new Vec2(), {
            density: 512,
            filter: physicsFilters.tank
        })

        const body = PhysicsUtils.dynamicBody(world.world, {
            angularDamping: 0.1,
            linearDamping: 0.1
        });

        body.CreateFixture(bodyFixture)

        for (let wheel of this.behaviour.wheels) {
            const fixture = PhysicsUtils.squareFixture(0.175, 0.5, wheel.position, {
                density: 512,
                filter: physicsFilters.tank
            })
            body.CreateFixture(fixture)
        }

        this.addComponent(new PhysicalComponent(body, world))
    }
}
