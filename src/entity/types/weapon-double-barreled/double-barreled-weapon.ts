import FirearmWeaponComponent from "src/entity/components/weapon/firearm-weapon-component";
import BulletBehaviour, {BulletBehaviourConfig} from "src/server/entity/bullet-behaviour";
import Bullet16mmPrefab from "../bullet-16mm/server-prefab";

export default class DoubleBarreledWeapon extends FirearmWeaponComponent {
	public state: number = 0;
	bulletConfig: Partial<BulletBehaviourConfig> | null = null
	barrelOffset: number = 0.35
	barrelLength: number = 2.5

	setBulletConfig(config: Partial<BulletBehaviourConfig>) {
		this.bulletConfig = config
		return this
	}

	shoot() {
		super.shoot()
		const shift = (this.state === 0) ? -this.barrelOffset : this.barrelOffset;

		let bullet = this.launchBullet(Bullet16mmPrefab, this.barrelLength, shift)
		Object.assign(bullet.getComponent(BulletBehaviour).config, this.bulletConfig)

		this.state = 1 - this.state

		this.popBullet()
	}

	setBarrelOffset(offset: number) {
		this.barrelOffset = offset
		return this
	}

	setBarrelLength(length: number) {
		this.barrelLength = length
		return this
	}
}
