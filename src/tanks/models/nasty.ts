
import TankModel from '../tankmodel';
import PhysicsUtils from '../../utils/physicsutils';
import * as Box2D from '../../library/box2d';
import AirbagTankBehaviour from '../physics/airbagbehaviour';
import WeaponFlamethrower from '../../weapon/models/flamethrower';

class NastyTank extends TankModel {

    public static typeName = 7
    public behaviour: AirbagTankBehaviour

    public static readonly vertices = [
        [-1.00,  -1.10],
        [-0.80,  -1.30],
        [ 0.80,  -1.30],
        [ 1.00,  -1.10],
        [ 1.00,  -0.25],
        [ 0.55,   0.90],
        [-0.55,   0.90],
        [-1.00,  -0.25],
    ]

    constructor() {
        super()

        this.behaviour = new AirbagTankBehaviour(this, {})
    }

    static getWeapon() {
        return WeaponFlamethrower
    }

    static getMaximumHealth() {
        return 15
    }

    initPhysics(world: Box2D.World) {
        this.world = world

        let size = 9

        let vertexArray = NastyTank.vertices.map(v => new Box2D.Vec2(v[0] * size, v[1] * size));

        let bodyFixture = PhysicsUtils.vertexFixture(vertexArray)

        this.body = PhysicsUtils.dynamicBody(world, {
            linearDamping: 0.8,
            angularDamping: 0.7
        });

        this.body.CreateFixture(bodyFixture)

        this.world = world
    }
}

export default NastyTank;