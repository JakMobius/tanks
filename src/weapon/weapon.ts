import Axle from "../controls/axle";
import HealthComponent from "../entity/components/health-component";
import EntityModel from "../entity/entity-model";

export interface WeaponConfig {
    tank: EntityModel
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
    tank: EntityModel = null

    constructor(config: WeaponConfig) {
        this.tank = config.tank
        this.triggerAxle = config.triggerAxle
        this.engaged = false
    }

    tick(dt: number) {
        if(!this.triggerAxle) return
        if (this.tank.getComponent(HealthComponent).getHealth() <= 0) {
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
