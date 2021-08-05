import {WeaponConfig} from '../weapon';
import ReloadableWeapon from "../reloadable-weapon";

export interface ShotgunConfig extends WeaponConfig {
    damage?: number
    radius?: number
    angle?: number
}

export default class Shotgun extends ReloadableWeapon {

	public readonly damage: number;
	public readonly radius: number;
	public readonly angle: number;

    private squareRadius: number;

    constructor(config: ShotgunConfig) {

        config = Object.assign(config, {
            damage: 6,
            radius: 60,
            shootRate: 800,
            reloadTime: 4000,
            maxAmmo: 3,
            angle: Math.PI / 2
        })

        super(config);
        this.squareRadius = this.radius ** 2
        this.angle = config.angle
    }

    clone() {
        return new Shotgun(this)
    }

    shoot() {
        // TODO
        // const player = tank.player
        // const bx = -tank.model.matrix.sin * 7000;
        // const by = tank.model.matrix.cos * 7000;
        // const screen = player.screen
        //
        // const position = tank.model.body.GetPosition()
        //
        // tank.model.body.ApplyImpulse(new Box2D.b2Vec2(-bx, -by), position)
        //
        // const pAngle = (tank.model.rotation + Math.PI) % (Math.PI * 2) - Math.PI;
        //
        // for (let client of screen.clients.values()) {
        //     const p = client.data.player;
        //
        //     if (!p || p.id === player.id) continue
        //
        //     const otherTank = p.tank
        //     const otherPosition = otherTank.model.body.GetPosition()
        //
        //     const x = otherPosition.x - position.x;
        //     const y = otherPosition.y - position.y;
        //
        //     const dist = x ** 2 + y ** 2;
        //
        //     if (dist > this.squareRadius) continue
        //
        //     let setAngle = Math.atan2(x, y) + pAngle;
        //
        //     if (setAngle > Math.PI) setAngle -= Math.PI * 2
        //     if (setAngle < -Math.PI) setAngle += Math.PI * 2
        //
        //     if (Math.abs(setAngle) >= this.setAngle / 2) continue
        //
        //     const lengthCoef = (Math.sqrt(1 - dist / this.squareRadius
        //     ));
        //     const damage = lengthCoef * this.damage;
        //
        //     p.tank.damage(damage, player.id)
        //
        //     tank.model.body.ApplyImpulse(new b2Vec2(lengthCoef * bx, lengthCoef * by), position)
        // }
        //
        // this.popBullet()
        //
        // const msg = JSON.stringify({
        //     cmd: "ent",
        //     p: [{
        //         i: screen.entityID++,
        //         s: player.id,
        //         w: this.name,
        //     }]
        // });
        //
        // screen.broadcast(msg)
    }
}