import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import ReadBuffer from "src/serialization/binary/read-buffer";
import Axle from "src/controls/axle";
import Entity from "src/utils/ecs/entity";
import TankControls from "src/controls/tank-controls";
import PlayerControlsPacket from "src/networking/packets/game-packets/player-controls-packet";

export default class PlayerTankControlComponent extends EventHandlerComponent {

    throttleAxle = new Axle()
    steerAxle = new Axle()
    primaryWeaponAxle = new Axle()
    minerAxle = new Axle()

    constructor() {
        super();

        this.eventHandler.on("tank-set", (tank) => this.onTankSet(tank))
        this.eventHandler.on("player-controls", (packet) => this.updateState(packet))
    }

    updateState(packet: PlayerControlsPacket): void {
        let reader = new ReadBuffer(packet.controlsData.buffer)

        const yValue = Math.max(Math.min(reader.readFloat32(), 1), -1)
        const xValue = Math.max(Math.min(reader.readFloat32(), 1), -1)
        let weapons = reader.readUint8()

        this.steerAxle.setValue(xValue)
        this.throttleAxle.setValue(yValue)
        this.primaryWeaponAxle.setValue(weapons & 0b00000001)
        this.minerAxle.setValue(weapons & 0b00000010)
    }

    private onTankSet(tank: Entity) {
        this.throttleAxle.disconnectAll()
        this.steerAxle.disconnectAll()
        this.primaryWeaponAxle.disconnectAll()
        this.minerAxle.disconnectAll()

        if(tank) {
            let controlsComponent = tank.getComponent(TankControls)
            controlsComponent.axles.get("x").addSource(this.steerAxle)
            controlsComponent.axles.get("y").addSource(this.throttleAxle)
            controlsComponent.axles.get("primary-weapon").addSource(this.primaryWeaponAxle)
            controlsComponent.axles.get("miner").addSource(this.minerAxle)
        }
    }
}