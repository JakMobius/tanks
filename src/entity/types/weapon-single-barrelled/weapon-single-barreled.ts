import FirearmWeaponComponent from "src/entity/components/weapon/firearm-weapon-component";
import * as Box2D from '@box2d/core'

export default class WeaponSingleBarreled extends FirearmWeaponComponent {

    public bulletType: number | null = null
    public muzzlePoint: Box2D.XY = {x: 0, y: 0}

    setBulletType(type: number) {
        this.bulletType = type
        return this
    }

    setMuzzlePoint(point: Box2D.XY) {
        this.muzzlePoint = point
        return this
    }

    shoot() {
        super.shoot()
        this.launchBullet(this.bulletType, this.muzzlePoint.x, this.muzzlePoint.y)
        this.popBullet()
    }
}