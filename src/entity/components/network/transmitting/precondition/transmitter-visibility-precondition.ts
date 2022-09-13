import TransmitterPrecondition from "./transmitter-precondition";
import Entity from "../../../../../utils/ecs/entity";
import BasicEventHandlerSet from "../../../../../utils/basic-event-handler-set";
import Transmitter from "../transmitter";
import {TransmitterSet} from "../transmitter-set";

// This transmitter precondition makes sure that the transmitter
// is only enabled when all the entities it points to are
// visible to the receiver.

export default class TransmitterVisibilityPrecondition extends TransmitterPrecondition {

    private visibleEntities = 0
    private entities: Entity[] = []
    receivingEndEventHandler = new BasicEventHandlerSet()
    enabled = false

    constructor(transmitter: Transmitter) {
        super(transmitter);

        this.receivingEndEventHandler.on("transmitter-set-attached", (set) => this.onTransmitterSetAttach(set))
        this.receivingEndEventHandler.on("transmitter-set-detached", (set) => this.onTransmitterSetDetach(set))
    }

    private onTransmitterSetAttach(set: TransmitterSet) {
        let entity = set.transmitComponent.entity

        // TODO: benchmark. Maybe it's better to use set here?
        if(this.entities.indexOf(entity) !== -1) {
            this.visibleEntities++
            this.updateTransmitterState()
        }
    }

    private onTransmitterSetDetach(set: TransmitterSet) {
        let entity = set.transmitComponent.entity

        // TODO: benchmark. Maybe it's better to use set here?
        if(this.entities.indexOf(entity) !== -1) {
            this.visibleEntities--
            this.updateTransmitterState()
        }
    }

    setEntityArray(array: Entity[]) {
        this.entities = array
        this.countVisibleEntities()
    }

    private countVisibleEntities() {
        this.visibleEntities = 0
        for(let entity of this.entities) {
            if(this.transmitter.entityCanBePointed(entity)) {
                this.visibleEntities++
            }
        }
        this.updateTransmitterState()
    }

    transmitterAttachedToRoot() {
        this.receivingEndEventHandler.setTarget(this.transmitter.set.receivingEnd)
        this.enabled = true
        this.updateTransmitterState()
    }

    transmitterDetachedFromRoot() {
        this.receivingEndEventHandler.setTarget(null)
        this.enabled = false
    }

    private updateTransmitterState() {
        if(!this.enabled) return
        let shouldBeEnabled = this.visibleEntities === this.entities.length
        if(shouldBeEnabled === this.transmitter.enabled) return

        if(shouldBeEnabled) {
            this.transmitter.onEnable()
        } else {
            this.transmitter.onDisable()
        }
    }

}