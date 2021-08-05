
import ReloadableWeapon, {ReloadableWeaponConfig} from "./reloadable-weapon";
import BulletModel from "../entity/bullets/bullet-model";
import * as Box2D from '../library/box2d'

export interface SingleBarreledWeaponConfig extends ReloadableWeaponConfig {
    bulletType: typeof BulletModel
    muzzlePoint: Box2D.Vec2
}

export default class SingleBarreledWeapon extends ReloadableWeapon {

    public bulletType: typeof BulletModel;
    public muzzlePoint: Box2D.Vec2

    constructor(config: SingleBarreledWeaponConfig) {
        super(config);

        this.bulletType = config.bulletType
        this.muzzlePoint = config.muzzlePoint
    }

    shoot() {
        const bullet = new (this.bulletType)()
        this.launchBullet(bullet, this.muzzlePoint.x, this.muzzlePoint.y)
        this.popBullet()
    }
}