
import { Component } from "src/utils/ecs/component";
import Transmitter from "./transmitter";
import { Constructor } from "src/utils/constructor";
import { TransmitterSet } from "./transmitter-set";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";

let components = new Map<Constructor<Transmitter>, Constructor<Component>>()

export function transmitterComponentFor(transmitter: Constructor<Transmitter>) {
    let existingComponent = components.get(transmitter)
    if(existingComponent) {
        return new existingComponent()
    }

    class TransmitterComponent extends EventHandlerComponent {
        constructor() {
            super();
            this.eventHandler.on("transmitter-set-added", (transmitterSet: TransmitterSet) => {
                transmitterSet.initializeTransmitter(transmitter);
            });
        }
    }

    Object.defineProperty(TransmitterComponent, 'name', { value: `TransmitterComponent<${transmitter.name}>` });
    existingComponent = TransmitterComponent
    components.set(transmitter, existingComponent)
    return new existingComponent()
}