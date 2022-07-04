import Weapon, {WeaponConfig} from '../weapon';
import TankFireEffectModel from 'src/effects/models/tank-fire-effect-model';
import PhysicalComponent from "../../entity/components/physics-component";
import EffectHostComponent from "../../effects/effect-host-component";
import ServerEffect from "../../server/effects/server-effect";

export interface FlamethrowerConfig extends WeaponConfig {
	damage?: number
	radius?: number
	angle?: number
}

export default class FlamethrowerWeapon extends Weapon {
	public damage: number;
	public radius: number;
	public angle: number;
	public squareRadius: number;
	public fireEffect: TankFireEffectModel;
	public serverEffect: ServerEffect;

	constructor(config: FlamethrowerConfig) {
		config = Object.assign({
			damage: 10,
			radius: 90,
			angle: Math.PI / 3
		}, config)
		super(config)

		this.damage = config.damage
		this.radius = config.radius
		this.angle = config.angle
		this.squareRadius = this.radius ** 2

		this.fireEffect = new TankFireEffectModel()
		this.serverEffect = ServerEffect.fromModel(this.fireEffect)
	}

	tick(dt: number) {
		super.tick(dt)

		if(!this.engaged) return

		const tank = this.tank
		const tankBody = tank.getComponent(PhysicalComponent).getBody()
		const tankLocation = tankBody.GetPosition()
		const tankAngle = tankBody.GetAngle()

		const pAngle = (tankAngle + Math.PI) % (Math.PI * 2) - Math.PI;

		const world = tank.parent

		for (let entity of world.children.values()) {

			const anotherTankLocation = entity.getComponent(PhysicalComponent).getBody().GetPosition()

			const x = anotherTankLocation.x - tankLocation.x;
			const y = anotherTankLocation.y - tankLocation.y;

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
		this.tank.getComponent(EffectHostComponent).addEffect(this.serverEffect)
	}

	onDisengage() {
		super.onDisengage();
		this.tank.getComponent(EffectHostComponent).removeEffect(this.serverEffect)
	}
}