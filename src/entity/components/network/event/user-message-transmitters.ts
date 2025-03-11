import Transmitter from "src/entity/components/network/transmitting/transmitter";
import {UserMessageType} from "src/entity/components/network/event/user-message";
import {Commands} from "src/entity/components/network/commands";
import Entity from "src/utils/ecs/entity";
import TransmitterVisibilityPrecondition
    from "src/entity/components/network/transmitting/precondition/transmitter-visibility-precondition";

export class UserChooseTankMessageTransmitter extends Transmitter {
    sendChooseTankMessage() {
        this.packIfEnabled(Commands.USER_MESSAGE_COMMAND, (buffer) => {
            buffer.writeInt16(UserMessageType.chooseTank)
        })
    }
}

export class UserTankChangeOnRespawnMessageTransmitter extends Transmitter {
    sendTankChangeOnRespawnMessage(tankId: string) {
        this.packIfEnabled(Commands.USER_MESSAGE_COMMAND, (buffer) => {
            buffer.writeInt16(UserMessageType.tankChangeOnRespawnMessage)
            buffer.writeString(tankId)
        })
    }
}

export class UserSelfDestructMessageTransmitter extends Transmitter {

    isSelfDestructing: boolean = false
    timer: Entity | null
    visibilityPrecondition = new TransmitterVisibilityPrecondition(this)

    constructor() {
        super();
        this.transmitterPrecondition = this.visibilityPrecondition
    }

    selfDestructionStarted(timer: Entity) {
        this.isSelfDestructing = true
        this.timer = timer
        this.updatePrecondition()
        this.sendUpdate()
    }

    selfDestructionCancelled() {
        this.isSelfDestructing = false
        this.timer = null
        this.updatePrecondition()
        this.sendUpdate()
    }

    updatePrecondition() {
        if(this.isSelfDestructing) {
            this.visibilityPrecondition.setEntityArray([this.timer])
        } else {
            this.visibilityPrecondition.setEntityArray([])
        }
    }

    onEnable() {
        super.onEnable()
        this.sendUpdate()
    }

    sendUpdate() {
        this.packIfEnabled(Commands.USER_MESSAGE_COMMAND, (buffer) => {
            buffer.writeInt16(UserMessageType.selfDestructMessage)
            buffer.writeUint8(this.isSelfDestructing as any as number)
            if(this.isSelfDestructing) {
                this.pointToEntity(this.timer)
            }
        })
    }
}