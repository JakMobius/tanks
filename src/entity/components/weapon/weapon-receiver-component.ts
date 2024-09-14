import ReceiverComponent from "src/entity/components/network/receiving/receiver-component";
import EntityDataReceiveComponent from "src/entity/components/network/receiving/entity-data-receive-component";
import {Commands} from "src/entity/components/network/commands";
import {WeaponComponent, WeaponType} from "src/entity/components/weapon/weapon-component";

export default class WeaponReceiverComponent extends ReceiverComponent {

    hook(receiveComponent: EntityDataReceiveComponent): void {

        receiveComponent.commandHandlers.set(Commands.WEAPON_INFO, (buffer) => {
            this.entity.getComponent(WeaponComponent).setInfo({
                type: buffer.readUint8(),
                role: buffer.readUint8(),
                id: buffer.readString(),
            })
        })

        receiveComponent.commandHandlers.set(Commands.WEAPON_STATE, (buffer) => {
            let info = this.entity.getComponent(WeaponComponent).info.type!

            if (info === WeaponType.firearm) {
                this.entity.getComponent(WeaponComponent).setState({
                    isReloading: buffer.readUint8() !== 0,
                    currentAmmo: buffer.readUint16(),
                    maxAmmo: buffer.readUint16()
                })
            } else {
                this.entity.getComponent(WeaponComponent).setState({
                    currentCharge: buffer.readFloat32(),
                    chargingSpeed: buffer.readFloat32()
                })
            }
        })
    }
}
