
const TankBehaviour = require("../tanks/physics/tankbehaviour")
const TankControls = require("./controls/tankcontrols")
const RotationalMatrix = require("../utils/rotationalmatrix")
const BinarySerializable = require("../serialization/binary/serializable")
const Box2D = require("../library/box2d")

/**
 * Tank model. Сombines the physical model
 * of the tank, its behavior and controls.
 * This class used both on client and server
 * side. Can be updated dynamically through
 * binary serialization.
 */

class TankModel extends BinarySerializable {
    static SERIALIZATION_GROUP_NAME = 4
    static Types = new Map();

    /**
     * Physical behaviour of this tank
     * @type TankBehaviour
     */
    behaviour = null

    /**
     * Box2D World, containing this tank.
     * @type b2World
     */

     world = null

    /**
     * Box2D body of this tank.
     * @type b2Body
     */
    body = null

    /**
     * @type TankControls
     */
    controls = null

    /**
     * @type number
     */
    health = 0

    /**
     * @type RotationalMatrix
     */
    matrix = null

    /**
     * @type b2Vec2
     */
    targetPosition

    constructor() {
        super()

        this.behaviour = null
        this.world = null
        this.body = null
        this.controls = new TankControls(this)
        this.health = this.constructor.getMaximumHealth()
        this.matrix = new RotationalMatrix()
        this.targetPosition = null
    }

    initPhysics(world) {
        throw new Error("Abstract class instancing is invalid.")
    }

    destroy() {
        this.world.DestroyBody(this.body)
    }

    get x() { return this.body.m_xf.position.x }
    get y() { return this.body.m_xf.position.y }
    set x(x) { this.body.m_xf.position.x = x }
    set y(y) { this.body.m_xf.position.y = y }
    get rotation() { return this.body.m_sweep.a }
    set rotation(rotation) { this.body.m_sweep.a = rotation; this.matrix.angle(rotation) }

    static getWeapon() {
        throw new Error("Abstract class instancing is illegal")
    }

    static canPlaceMines() {
        return true
    }

    static getMaximumHealth() {
        return 10
    }

    static getId() {
        return 0
    }

    // Serialization stuff

    toBinary(encoder) {}
    static fromBinary(decoder) { return new this }

    static typeName() {
        return this.getId()
    }

    static groupName() {
        return this.SERIALIZATION_GROUP_NAME
    }
}

module.exports = TankModel
