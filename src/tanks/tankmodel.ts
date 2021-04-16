
import TankBehaviour from '../tanks/physics/tankbehaviour';
import TankControls from './controls/tankcontrols';
import RotationalMatrix from '../utils/rotationalmatrix';
import BinarySerializable, {Constructor} from '../serialization/binary/serializable';
import * as Box2D from '../library/box2d';
import BinaryEncoder from "../serialization/binary/binaryencoder";
import BinaryDecoder from "../serialization/binary/binarydecoder";
import Weapon from "../weapon/weapon";

/**
 * Tank model. Сombines the physical model
 * of the tank, its behavior and controls.
 * This class used both on client and server
 * side. Can be updated dynamically through
 * binary serialization.
 */

class TankModel implements BinarySerializable<typeof TankModel> {
    static Types = new Map();

    // Physical behaviour of this tank
    behaviour: TankBehaviour = null

    // Box2D World, containing this tank.
    world: Box2D.World = null

    // Box2D body of this tank.
    body: Box2D.Body = null

    controls: TankControls = null
    health = 0
    matrix: RotationalMatrix = null

    targetPosition: Box2D.Vec2

    constructor() {
        this.behaviour = null
        this.world = null
        this.body = null
        this.controls = new TankControls(this)
        this.health = (<typeof TankModel>this.constructor).getMaximumHealth()
        this.matrix = new RotationalMatrix()
        this.targetPosition = null
    }

    initPhysics(world: Box2D.World) {
        throw new Error("Abstract class instancing is invalid.")
    }

    destroy() {
        this.world.DestroyBody(this.body)
    }

    get x() { return this.body.m_xf.p.x }
    get y() { return this.body.m_xf.p.y }
    set x(x: number) { this.body.m_xf.p.x = x }
    set y(y: number) { this.body.m_xf.p.y = y }
    get rotation() { return this.body.m_sweep.a }
    set rotation(rotation) { this.body.m_sweep.a = rotation; this.matrix.setAngle(rotation) }

    static getWeapon(): typeof Weapon {
        throw new Error("Abstract class instancing is illegal")
    }

    static canPlaceMines(): boolean {
        return true
    }

    static getMaximumHealth(): number {
        return 10
    }

    static getId(): number {
        return this.typeName
    }

    // Serialization stuff

    toBinary(encoder: BinaryEncoder) {}
    static fromBinary<T>(this: Constructor<T>, decoder: BinaryDecoder): T { return new this }

    static typeName = 0
    static groupName = 4
}

export default TankModel;
