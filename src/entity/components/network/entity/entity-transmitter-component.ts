import {Transmitter} from "../transmitting/transmitter";
import {TransmitterSet} from "../transmitting/transmitter-set";

export default class EntityTransmitterComponent extends Transmitter {
    constructor() {
        super()
    }

    attachToSet(set: TransmitterSet) {
        super.attachToSet(set);
    }

    detachFromSet() {
        super.detachFromSet();
    }
}
