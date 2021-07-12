import Weapon, {WeaponConfig} from '../weapon';
import TankFireEffectModel from 'src/effects/tank/tank-fire-effect-model';
import ServerTankEffect from 'src/server/effects/tank/servertankeffect';

export interface FlamethrowerConfig extends WeaponConfig {
	damage?: number
	radius?: number
	angle?: number
}

class Flamethrower extends Weapon {
	public damage: any;
	public radius: any;
	public angle: any;
	public squareRadius: any;
	public fireEffect: any;
	public serverEffect: any;

	constructor(config: FlamethrowerConfig) {
		config = Object.assign({
			damage: 10,
			radius: 90,
			angle: Math.PI / 3,
		}, config)
		super(config)

		this.damage = config.damage
		this.radius = config.radius
		this.angle = config.angle
		this.squareRadius = this.radius ** 2

		this.fireEffect = new TankFireEffectModel()
		this.serverEffect = ServerTankEffect.fromModelAndTank(this.fireEffect, this.tank)
	}

	ready() {
		return true
	}

	shoot() {
		const tank = this.tank
		// const player = tank.player
		const pAngle = (tank.model.rotation + Math.PI) % (Math.PI * 2) - Math.PI;

		const world = tank.player.getWorld()

		for (let player of world.players.values()) {

			if(!player || player.tank === tank) continue

			const anotherTank = player.tank;
			const x = anotherTank.model.x - tank.model.x;
			const y = anotherTank.model.y - tank.model.y;

			const dist = x ** 2 + y ** 2;

			if(dist > this.squareRadius) continue

			let angle = Math.atan2(x, y) + pAngle;

			if(angle > Math.PI) angle -= Math.PI * 2
			if(angle < -Math.PI) angle += Math.PI * 2

			 if(Math.abs(angle) >= this.angle / 2) continue

			//const damage = (Math.sqrt(1 - dist / this.squareRadius)) * this.damage * tank.world.room.spt

			//p.tank.damage(damage, player.id)
		}
	}

	onEngage() {
		super.onEngage();
		this.tank.addEffect(this.serverEffect)
	}

	onDisengage() {
		super.onDisengage();
		this.tank.removeEffect(this.serverEffect)
	}
}

export default Flamethrower;