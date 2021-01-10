
import AbstractTank from '../../tanks/abstracttank';
import TankModel from '../../tanks/tankmodel';
import Weapon from '../../weapon/weapon';
import MinerWeapon from '../../weapon/models/miner';
import BinaryEncoder from 'src/serialization/binary/binaryencoder';
import ServerTankEffect from "../effects/tank/servertankeffect";
import DamageReason from "./damagecause/damagereason";
import ServerGameWorld from "../servergameworld";

export interface ServerTankConfig {
    type: typeof TankModel
    world: ServerGameWorld
}

class ServerTank extends AbstractTank {
	public teleported: boolean;
	public health: number;

    primaryWeapon: Weapon | null = null

    minerWeapon: Weapon | null = null

    world: ServerGameWorld = null

    constructor(options: ServerTankConfig) {
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

    tick(dt: number): void {
        this.primaryWeapon.tick()
        this.minerWeapon.tick()

        this.model.rotation = this.model.body.GetAngle()
        this.model.behaviour.tick(dt)
    }

    addDamageReason(reason: DamageReason): void {
        // TODO
    }

    damage(damage: number, reason: DamageReason): void {
        this.addDamageReason(reason)
        this.model.health = Math.max(0, this.model.health - damage)
    }

    encodeDynamicData(encoder: BinaryEncoder): void {
        encoder.writeUint8(this.teleported as any as number)
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

    addEffect(effect: ServerTankEffect): void {
        if(this.effects.has(effect.model.id)) {
            return
        }
        // TODO: Это криво
        effect.model.tankId = this.player.id
        this.effects.set(effect.model.id, effect)
        this.world.addTankEffect(effect, this)
    }

    removeEffect(effect: ServerTankEffect): void {
        if(this.effects.delete(effect.model.id)) {
            this.world.removeTankEffect(effect, this)
        }
    }
}

export default ServerTank;