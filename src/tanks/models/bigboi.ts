import TankModel from '../tankmodel';
import PhysicsUtils from '../../utils/physicsutils';
import BasicTankBehaviour from '../physics/trucktankbehaviour';
import * as Box2D from '../../library/box2d';
import Cannon from '../../weapon/models/cannon';

class BigBoiTank extends TankModel {

    public static typeName = 5
    public behaviour: BasicTankBehaviour

    constructor() {
        super();

        this.behaviour = new BasicTankBehaviour(this, {
            power: 40000
        });
    }

    static getWeapon() {
        return Cannon
    }

    static getMaximumHealth() {
        return 20
    }

    initPhysics(world: Box2D.World) {
        this.world = world

        let size = 9

        const segment = size / 2;

        let bodyFixture = PhysicsUtils.squareFixture(
            size,
            size * 0.87,
            null,{
            density: 3.5
        })
        let trackFixtures = PhysicsUtils.horizontalSquareFixtures(
            segment,
            size,
            new Box2D.Vec2(size, 0), {
            density: 2
        })

        this.body = PhysicsUtils.dynamicBody(world, {
            linearDamping: 0.5
        });
        this.body.CreateFixture(bodyFixture)
        for(let fixture of trackFixtures)
            this.body.CreateFixture(fixture)
    }
}

export default BigBoiTank;