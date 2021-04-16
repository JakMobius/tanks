import TankModel from '../tankmodel';
import PhysicsUtils from '../../utils/physicsutils';
import WheeledTankBehaviour from '../physics/wheeledtankbehaviour';
import * as Box2D from '../../library/box2d';
import WeaponMachineGun from '../../weapon/models/machinegun';
import {b2World} from "../../library/box2d/dynamics/b2_world";
import {Vec2} from "../../library/box2d";

class MonsterTankModel extends TankModel {

    public static typeName = 3
    public behaviour: WheeledTankBehaviour

    constructor() {
        super()

        this.behaviour = new WheeledTankBehaviour(this, {
            power: 30000
        });
    }

    static getWeapon() {
        return WeaponMachineGun
    }

    static getMaximumHealth() {
        return 10
    }

    initPhysics(world: b2World) {
        this.world = world

        let size = 10

        let bodyFixture = PhysicsUtils.squareFixture(size * 0.6, size, new Vec2())

        this.body = PhysicsUtils.dynamicBody(world, {
            linearDamping: 0.3
        });

        this.body.CreateFixture(bodyFixture)

        for (let axleOffset of this.behaviour.axleOffsetList) {
            this.addWheels(PhysicsUtils.horizontalSquareFixtures(size * 0.07, size * 0.2, new Vec2(this.behaviour.axleWidth, axleOffset)))
        }
    }

    addWheels(wheels: Box2D.IFixtureDef[]) {
        for(let fixture of wheels)
            this.body.CreateFixture(fixture)
    }
}

export default MonsterTankModel;
