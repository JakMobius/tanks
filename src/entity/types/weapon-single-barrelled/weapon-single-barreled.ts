import FirearmWeaponComponent from "src/entity/components/weapon/firearm-weapon-component";
import * as Box2D from '@box2d/core'
import { EntityPrefab } from "src/entity/entity-prefabs";

export default class WeaponSingleBarreled extends FirearmWeaponComponent {

    public bulletPrefab: EntityPrefab | null = null
    public muzzlePoint: Box2D.XY = {x: 0, y: 0}

    setBulletPrefab(bulletPrefab: EntityPrefab) {
        this.bulletPrefab = bulletPrefab
        return this
    }

    setMuzzlePoint(point: Box2D.XY) {
        this.muzzlePoint = point
        return this
    }

    shoot() {
        super.shoot()
        this.launchBullet(this.bulletPrefab, this.muzzlePoint.x, this.muzzlePoint.y)
        this.popBullet()
    }
}