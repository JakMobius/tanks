import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import {ChargeWeaponState, WeaponComponent, WeaponType} from "src/entity/components/weapon/weapon-component";

export default class ClientWeaponComponent extends EventHandlerComponent {
    constructor() {
        super();

        this.eventHandler.on("tick", (dt) => {
            this.updateCharge(dt)
        })
    }

    updateCharge(dt: number) {
        let weaponComponent = this.entity.getComponent(WeaponComponent)
        let info = weaponComponent?.info

        if (info?.type !== WeaponType.charge) {
            return
        }

        let state = weaponComponent?.state as ChargeWeaponState
        if (!state) {
            return
        }

        state.currentCharge = Math.max(0, Math.min(1, state.currentCharge + state.chargingSpeed * dt))
    }
}