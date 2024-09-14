import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import Entity from "src/utils/ecs/entity";
import WeaponStungun from "src/entity/types/weapon-stungun/weapon-stungun";

export enum WeaponType {
    firearm,
    charge
}

export enum WeaponRole {
    primary,
    miner
}

export interface WeaponInfo {
    type: WeaponType,
    id: string | null,
    role: WeaponRole
}

export interface WeaponInfoBase {
}

export interface FirearmWeaponState extends WeaponInfoBase {
    maxAmmo: number
    currentAmmo: number
    isReloading: boolean
}

export interface ChargeWeaponState extends WeaponInfoBase {
    currentCharge: number
    chargingSpeed: number
}

export type WeaponState = FirearmWeaponState | ChargeWeaponState

export class WeaponComponent extends EventHandlerComponent {
    state: WeaponState | null
    info: WeaponInfo | null
    tank: Entity

    constructor() {
        super();

        this.eventHandler.on("attached-to-parent", (parent) => {
            this.setTank(parent)
        })
    }

    setTank(tank: Entity) {
        if (this.tank) this.tank.emit("weapon-detach", this.entity)
        this.tank = tank
        if (this.tank) this.tank.emit("weapon-attach", this.entity)
        this.entity.emit("tank-set", tank)
    }

    setInfo(info: WeaponInfo | null) {
        this.info = info
        this.entity.emit("weapon-info-update", info)
        return this
    }

    setState(state: WeaponState | null) {
        if (this.info?.type === WeaponType.firearm) {
            let oldIsReloading = (this.state as FirearmWeaponState)?.isReloading
            let newIsReloading = (state as FirearmWeaponState).isReloading

            if (oldIsReloading && !newIsReloading) {
                this.entity.emit("weapon-reload-end")
            }

            if (newIsReloading && !oldIsReloading) {
                this.entity.emit("weapon-reload-start")
            }
        }
        this.state = state
        this.entity.emit("weapon-state-update", state)
        return this
    }
}