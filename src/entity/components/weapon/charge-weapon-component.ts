import ServerWeaponComponent from "src/entity/components/weapon/server-weapon-component";
import {WeaponComponent} from "src/entity/components/weapon/weapon-component";

export default class ChargeWeaponComponent extends ServerWeaponComponent {
    currentCharge: number = 0.0
    currentChargeSpeed: number = 0.0
    rechargeSpeed: number = 1.0
    chargeConsumption: number = 1.0
    ready: boolean = false
    isFiring: boolean = false
    needsStateUpdate: boolean = true

    tick(dt: number) {
        super.tick(dt)
        this.currentCharge = Math.max(0, Math.min(1, this.currentCharge + this.currentChargeSpeed * dt))

        if (this.currentCharge === 0 && this.ready) {
            this.needsStateUpdate = true
            this.ready = false
        }

        if (this.currentCharge !== 0 && !this.ready) {
            this.needsStateUpdate = true
            this.ready = true
        }

        if (this.needsStateUpdate) {
            this.updateState()
        }
    }

    updateState() {
        this.needsStateUpdate = false

        let isFiring = this.ready && this.engaged

        if (isFiring) {
            this.currentChargeSpeed = -this.chargeConsumption
        } else {
            if (this.engaged) {
                this.currentChargeSpeed = 0
            } else {
                this.currentChargeSpeed = this.rechargeSpeed
            }
        }

        this.setIsFiring(isFiring)

        this.entity?.getComponent(WeaponComponent).setState({
            currentCharge: this.currentCharge,
            chargingSpeed: this.currentChargeSpeed
        })
    }

    onEngage() {
        super.onEngage();
        this.needsStateUpdate = true
    }

    onDisengage() {
        super.onDisengage();
        this.needsStateUpdate = true
    }

    setRechargeSpeed(speed: number = 0.0) {
        this.rechargeSpeed = speed
        this.needsStateUpdate = true
        return this
    }

    setChargeConsumption(consumption: number = 0.0) {
        this.chargeConsumption = consumption
        this.needsStateUpdate = true
        return this
    }

    setIsFiring(isFiring: boolean) {
        this.isFiring = isFiring
    }
}
