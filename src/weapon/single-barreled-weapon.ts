import ReloadableWeapon, {ReloadableWeaponConfig} from "./reloadable-weapon";
import * as Box2D from '../library/box2d'

export interface SingleBarreledWeaponConfig extends ReloadableWeaponConfig {
    muzzlePoint: Box2D.Vec2
}

export default class SingleBarreledWeapon extends ReloadableWeapon {

    public bulletType: number
    public muzzlePoint: Box2D.Vec2

    constructor(config: SingleBarreledWeaponConfig) {
        super(config);

        this.bulletType = config.bulletType
        this.muzzlePoint = config.muzzlePoint
    }

    shoot() {
        this.launchBullet(this.bulletType, this.muzzlePoint.x, this.muzzlePoint.y)
        this.popBullet()
    }
}