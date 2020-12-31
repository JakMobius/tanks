import Weapon from '../weapon';
import TankFireEffectModel from '@/effects/tank/tankfireeffectmodel';
import ServerTankEffect from '@/server/effects/tank/servertankeffect';

class Flamethrower extends Weapon {
	public damage: any;
	public radius: any;
	public angle: any;
	public squareRadius: any;
	public fireEffect: any;
	public serverEffect: any;

	constructor(config) {
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

		for (let p of tank.world.players.values()) {

			if(!p || p.tank === tank) continue

			const anotherTank = p.tank;
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