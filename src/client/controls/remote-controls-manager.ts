import Axle from "src/controls/axle";
import RootControlsResponder, {ControlsResponder} from "src/client/controls/root-controls-responder";
import WriteBuffer from "src/serialization/binary/write-buffer";
import PlayerControlsPacket from "src/networking/packets/game-packets/player-controls-packet";
import Connection from "src/networking/connection";
import PlayerActionPacket, { PlayerActionType } from "src/networking/packets/game-packets/player-action-packet";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";

export default class RemoteControlsManager {
    controls: ControlsResponder
    axlesToSync: Map<string, Axle> = new Map()
    controlsEventHandler = new BasicEventHandlerSet()

    private writeBuffer = new WriteBuffer()
    private connection: Connection

    constructor(controls: ControlsResponder, connection: Connection) {
        this.controls = controls
        this.connection = connection
        this.axlesToSync.set("tank-throttle", new Axle())
        this.axlesToSync.set("tank-steer", new Axle())
        this.axlesToSync.set("tank-primary-weapon", new Axle())
        this.axlesToSync.set("tank-miner", new Axle())

        this.controlsEventHandler.on("tank-respawn", () => {
            new PlayerActionPacket(PlayerActionType.selfDestruct).sendTo(connection)
        })
        this.controlsEventHandler.on("tank-respawn-cancel", () => {
            new PlayerActionPacket(PlayerActionType.selfDestructCancel).sendTo(connection)
        })
        this.controlsEventHandler.on("tank-flag-drop", () => {
            new PlayerActionPacket(PlayerActionType.flagDrop).sendTo(connection)
        })
    }

    attach() {
        for(let [name, axle] of this.axlesToSync) {
            axle.addSource(this.controls.getControlAxle(name))
        }
        this.controlsEventHandler.setTarget(this.controls)
    }

    detach() {
        for(let [name, axle] of this.axlesToSync) {
            axle.removeSource(this.controls.getControlAxle(name))
        }
        this.controlsEventHandler.setTarget(null)
    }

    needsUpdate() {
        for(let axle of this.axlesToSync.values()) {
            if(axle.needsUpdate) {
                return true
            }
        }

        return false
    }

    updateIfNeeded() {
        if(!this.needsUpdate()) return

        this.writeBuffer.writeFloat32(this.axlesToSync.get("tank-throttle").getValue())
        this.writeBuffer.writeFloat32(this.axlesToSync.get("tank-steer").getValue())

        let weapons =
            (this.axlesToSync.get("tank-primary-weapon").getValue() > 0.5 as unknown as number & 1) << 0 |
            (this.axlesToSync.get("tank-miner").getValue() > 0.5 as unknown as number & 1) << 1

        this.writeBuffer.writeUint8(weapons)
        new PlayerControlsPacket(this.writeBuffer.spitBuffer()).sendTo(this.connection)
    }
}