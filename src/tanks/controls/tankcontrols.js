const BinarySerializable = require("../../serialization/binary/serializable.js")
const Axle = require("./axle")
class TankControls extends BinarySerializable {

    static groupName() {
        return TankControls.SERIALIZATION_GROUP_NAME
    }

    static typeName() {
        return 0
    }

    constructor(tank) {
        super();
        this.tank = tank

        this.throttle = 0
        this.steer = 0

        this.axles = new Map()
        this.axles.set("x", new Axle())
        this.axles.set("y", new Axle())
        this.axles.set("primary-weapon", new Axle())
        this.axles.set("miner", new Axle())

        this.primaryWeaponActive = false
        this.minerActive = false
        this.updated = false

        this.directional = false
        this.matrix = null
    }

    shouldUpdate() {
        if (this.updated) {
            this.updated = false
            return true
        }

        if (this.axles.get("primary-weapon").needsUpdate()) return true
        return !!this.axles.get("miner").needsUpdate();


    }

    static fromJson(json) {
        let controls = new TankControls()

        controls.updateState(json)

        return controls
    }

    getThrottle() {
        if (this.tank.health <= 0) {
            return 0
        }

        if (this.axles.get("y").needsUpdate()) {
            this.updateAxises()
        }
        return this.throttle
    }

    getSteer() {
        if (this.tank.health <= 0) {
            return 0
        }

        if (this.axles.get("x").needsUpdate()) {
            this.updateAxises()
        }
        return this.steer
    }

    getPrimaryWeaponAxle() {
        return this.axles.get("primary-weapon")
    }

    getMinerWeaponAxle() {
        return this.axles.get("miner")
    }

    isPrimaryWeaponActive() {
        if (this.tank.health <= 0) {
            return false
        }

        let axle = this.getPrimaryWeaponAxle()

        if (axle.needsUpdate()) {
            this.primaryWeaponActive = axle.getValue() > 0.5
        }

        return this.primaryWeaponActive
    }

    isMinerActive() {
        if (this.tank.health <= 0) {
            return false
        }

        let axle = this.getMinerWeaponAxle()

        if (axle.needsUpdate()) {
            this.minerActive = axle.getValue() > 0.5
        }

        return this.minerActive
    }

    updateAxises() {
        let x = this.axles.get("x").getValue()
        let y = this.axles.get("y").getValue()

        this.updated = true

        if (this.matrix && this.directional) {
            this.steer = this.matrix.turnHorizontalAxis(x, y)
            this.throttle = this.matrix.turnVerticalAxis(x, y)
        } else {
            this.throttle = y
            this.steer = x
        }
    }

    updateState(decoder) {
        this.axles.get("x").setValue(Math.max(Math.min(decoder.readFloat32(), 1), -1))
        this.axles.get("y").setValue(Math.max(Math.min(decoder.readFloat32(), 1), -1))
        let weapons = decoder.readUint8()

        this.axles.get("primary-weapon").setValue(weapons & 0b00000001)
        this.axles.get("miner").setValue(weapons & 0b00000010)

        this.updateAxises()
    }

    toBinary(encoder) {
        encoder.writeFloat32(this.axles.get("x").getValue())
        encoder.writeFloat32(this.axles.get("y").getValue())

        let weapons =
            (this.isPrimaryWeaponActive() & 1) << 0 |
            (this.isMinerActive() & 1) << 1

        encoder.writeUint8(weapons)
    }
}

module.exports = TankControls