
const AbstractTank = require("../../tanks/abstracttank")
const TankModel = require("../../tanks/tankmodel")
const Weapon = require("../../weapon/weapon")
const MinerWeapon = require("../../weapon/models/miner")

for(let tank of require("../../tanks/tankloader")) {
    TankModel.Types.set(tank.getId(), tank)
}

class ServerTank extends AbstractTank {

    /**
     * @type {Weapon | null}
     */
    primaryWeapon = null

    /**
     * @type {Weapon | null}
     */
    minerWeapon = null

    /**
     * @type {ServerGameWorld}
     */
    world = null

    /**
     * @param {Object} options
     * @param {Class<TankModel>} options.type
     * @param {ServerGameWorld} options.world
     */
    constructor(options) {
        super(options);

        this.model = new (options.type);

        const Weapon = options.type.getWeapon()

        this.primaryWeapon = new Weapon({
            tank: this,
            triggerAxle: this.model.controls.getPrimaryWeaponAxle()
        });

        if(options.type.canPlaceMines()) {
            this.minerWeapon = new MinerWeapon({
                tank: this,
                triggerAxle: this.model.controls.getMinerWeaponAxle()
            })
        }

        this.world = options.world

        if(this.world) {
            this.model.initPhysics(this.world.world)
        }

        this.teleported = false
    }

    tick(dt) {
        this.primaryWeapon.tick()
        this.minerWeapon.tick()

        this.model.rotation = this.model.body.GetAngle()
        this.model.behaviour.tick(dt)
    }

    addDamageReason(reason) {
        // TODO
    }

    damage(damage, reason) {
        this.addDamageReason(reason)
        this.model.health = Math.max(0, this.model.health - damage)
    }

    encodeDynamicData(encoder) {
        encoder.writeUint8(this.teleported)
        this.teleported = false
        let position = this.model.body.GetPosition()
        encoder.writeFloat32(position.x)
        encoder.writeFloat32(position.y)
        encoder.writeFloat32(this.model.body.GetAngle())

        let velocity = this.model.body.GetLinearVelocity()
        let angular = this.model.body.GetAngularVelocity()

        encoder.writeFloat32(velocity.x)
        encoder.writeFloat32(velocity.y)
        encoder.writeFloat32(angular)

        encoder.writeFloat32(this.health)
    }

    addEffect(effect) {
        if(this.effects.has(effect.model.id)) {
            return
        }
        // TODO: Это криво
        effect.model.tankId = this.player.id
        this.effects.set(effect.model.id, effect)
        this.world.addTankEffect(effect, this)
    }

    removeEffect(effect) {
        if(this.effects.delete(effect.model.id)) {
            this.world.removeTankEffect(effect, this)
        }
    }
}

module.exports = ServerTank