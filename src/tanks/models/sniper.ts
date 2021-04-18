import TankModel from '../tankmodel';
import PhysicsUtils from '../../utils/physicsutils';
import TruckTankBehaviour from '../physics/trucktankbehaviour';
import * as Box2D from '../../library/box2d';
import Weapon42mm from "../../weapon/models/42mm";

export default class SniperTank extends TankModel {

    public static typeName = 1
    public behaviour: TruckTankBehaviour

    constructor() {
        super();

        this.behaviour = new TruckTankBehaviour(this, {
            power: 50000,
            axleWidth: 7.5,
            truckLength: 15,
            truckFriction: 30000
        });
    }

    static getWeapon() {
        return Weapon42mm
    }

    initPhysics(world: Box2D.World) {

        this.world = world

        let size = 9
        const segment = size / 4;

        // Sniper is a tank. Tank should be massive

        let bodyFixture = PhysicsUtils.squareFixture(size / 2, size * 0.45, new Box2D.Vec2(0, 0), {
            density: 3
        })
        let trackFixtures = PhysicsUtils.horizontalSquareFixtures(segment, size, new Box2D.Vec2(-size / 2 - segment, size * 0.2))

        this.body = PhysicsUtils.dynamicBody(world, {
            angularDamping: 1.0,
            linearDamping: 0.5
        });

        this.body.CreateFixture(bodyFixture)
        for (let fixture of trackFixtures)
            this.body.CreateFixture(fixture)

        this.world = world
    }

    static getMaximumHealth() {
        return 10
    }
}