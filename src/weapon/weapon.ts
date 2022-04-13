import * as Box2D from '../library/box2d';
import Bullet42mmModel from '../entity/bullets/models/42mm-bullet-model';
import ServerBullet, {ServerBulletConfig} from '../server/entity/bullet/server-bullet';
import Axle from "../controls/axle";
import ServerTank from "../server/entity/tank/server-tank";
import BulletModel from "../entity/bullets/bullet-model";
import HealthComponent from "../entity/health-component";

export interface WeaponConfig {
    tank: ServerTank
    triggerAxle: Axle
}

export default class Weapon {

    /**
     * Indicates whether weapon is currently shooting
     */
    engaged: boolean = false

    /**
     * Trigger axle. Weapon will shoot if its value is above 0.5
     */
    triggerAxle: Axle | null = null

    /**
     * Tanks that equipped with this weapon
     */
    tank: ServerTank = null

    constructor(config: WeaponConfig) {
        this.tank = config.tank
        this.triggerAxle = config.triggerAxle
        this.engaged = false
    }

    tick(dt: number) {
        if(!this.triggerAxle) return
        if (this.tank.model.getComponent(HealthComponent).getHealth() <= 0) {
            if(this.engaged) {
                this.engaged = false
                this.onDisengage()
            }
            return;
        }

        let engaged = this.triggerAxle.getValue() > 0.5

        if (engaged !== this.engaged) {
            this.engaged = engaged
            if (engaged) {
                this.onEngage()
            } else {
                this.onDisengage()
            }
        }
    }

    onEngage() {

    }

    onDisengage() {

    }
}
