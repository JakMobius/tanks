
import TankModel from '../tank-model';
import PhysicsUtils from '../../../utils/physicsutils';
import * as Box2D from '../../../library/box2d';
import AirbagTankBehaviour from '../physics/airbag-tank-behaviour';
import {physicsFilters} from "../../../physics/categories";

export default class NastyTankModel extends TankModel<AirbagTankBehaviour> {

    public static typeName = 107

    public static readonly vertices = [
        [-1.00, -1.10],
        [-0.80, -1.30],
        [0.80, -1.30],
        [1.00, -1.10],
        [1.00, -0.25],
        [0.55, 0.90],
        [-0.55, 0.90],
        [-1.00, -0.25],
    ]

    constructor() {
        super()

        this.behaviour = new AirbagTankBehaviour(this, {})
    }

    static getMaximumHealth() {
        return 15
    }

    initPhysics(world: Box2D.World) {
        let size = 9

        let vertexArray = NastyTankModel.vertices.map(v => new Box2D.Vec2(v[0] * size, v[1] * size));

        let bodyFixture = PhysicsUtils.vertexFixture(vertexArray, {
            filter: physicsFilters.tank
        })

        const body = PhysicsUtils.dynamicBody(world, {
            linearDamping: 0.8,
            angularDamping: 0.7
        });

        body.CreateFixture(bodyFixture)

        this.setBody(body)
    }
}