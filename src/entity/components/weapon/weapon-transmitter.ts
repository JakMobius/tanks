import Transmitter from "src/entity/components/network/transmitting/transmitter";
import {Commands} from "src/entity/components/network/commands";
import {
    WeaponComponent,
    WeaponType,
    FirearmWeaponState, ChargeWeaponState
} from "src/entity/components/weapon/weapon-component";

export default class WeaponTransmitter extends Transmitter {

    constructor() {
        super();

        this.eventHandler.on("weapon-state-update", () => {
            this.queueWeaponStateUpdate()
        })

        this.eventHandler.on("weapon-info-update", () => {
            this.queueWeaponInfoUpdate()
        })
    }

    onEnable() {
        super.onEnable()
        this.queueWeaponInfoUpdate();
        this.queueWeaponStateUpdate();
    }

    queueWeaponInfoUpdate() {
        let info = this.getEntity().getComponent(WeaponComponent).info

        this.packIfEnabled(Commands.WEAPON_INFO, (buffer) => {
            buffer.writeUint8(info.type)
            buffer.writeUint8(info.role)
            buffer.writeString(info.id)
        })
    }

    queueWeaponStateUpdate() {
        let component = this.getEntity().getComponent(WeaponComponent)
        if (!component?.state) return

        this.packIfEnabled(Commands.WEAPON_STATE, (buffer) => {
            if (component.info.type === WeaponType.firearm) {
                let state = component.state as FirearmWeaponState

                buffer.writeUint8(state.isReloading ? 1 : 0)
                buffer.writeUint16(state.currentAmmo)
                buffer.writeUint16(state.maxAmmo)
            } else {
                let state = component.state as ChargeWeaponState

                buffer.writeFloat32(state.currentCharge)
                buffer.writeFloat32(state.chargingSpeed)
            }
        })
    }
}
