import HealthComponent from "src/entity/components/health-component";
import Entity from "src/utils/ecs/entity";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import TankControls from "src/controls/tank-controls";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import PlayerVisibilityManagerComponent from "src/entity/types/player/server-side/player-visibility-manager-component";
import ServerEntityPilotComponent from "src/server/entity/components/server-entity-pilot-component";
import {WeaponComponent, WeaponRole} from "src/entity/components/weapon/weapon-component";
import Axle from "src/controls/axle";
import {TransmitterSet} from "src/entity/components/network/transmitting/transmitter-set";
import WeaponTransmitter from "src/entity/components/weapon/weapon-transmitter";

export default class ServerWeaponComponent extends EventHandlerComponent {

    tankEventHandler = new BasicEventHandlerSet()
    pilot: Entity = null
    engaged: boolean = false

    constructor() {
        super()

        this.eventHandler.on("tank-set", (tank) => {
            this.tankEventHandler.setTarget(tank)
            this.setVisibilityFor(tank.getComponent(ServerEntityPilotComponent)?.pilot, true)
        })

        this.tankEventHandler.on("pilot-set", (pilot) => {
            if (pilot !== this.pilot) {
                this.setVisibilityFor(this.pilot, false)
                this.pilot = pilot
                this.setVisibilityFor(this.pilot, true)
            }
        })

        this.eventHandler.on("transmitter-set-added", (transmitterSet: TransmitterSet) => {
            transmitterSet.initializeTransmitter(WeaponTransmitter)
        })

        this.eventHandler.on("tick", (dt: number) => {
            this.tick(dt)
        })
    }

    setVisibilityFor(pilot: Entity, visible: boolean) {
        if (!pilot) return
        let visibilityComponent = pilot.getComponent(PlayerVisibilityManagerComponent)
        if (!visibilityComponent) return
        visibilityComponent.setEntityVisible(this.entity, visible)
    }

    tick(dt: number) {
        let weaponComponent = this.entity.getComponent(WeaponComponent)
        let tank = weaponComponent.tank
        let info = weaponComponent.info
        if (!tank || !info) return

        let controlsComponent = tank.getComponent(TankControls)
        if (!controlsComponent) return


        let controlAxle: Axle
        if (info.role === WeaponRole.miner) {
            controlAxle = controlsComponent.getMinerWeaponAxle()
        } else {
            controlAxle = controlsComponent.getPrimaryWeaponAxle()
        }

        if (!controlAxle) return

        if (tank.getComponent(HealthComponent).getHealth() <= 0) {
            if (this.engaged) {
                this.engaged = false
                this.onDisengage()
            }
            return;
        }

        let engaged = controlAxle.getValue() > 0.5

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
