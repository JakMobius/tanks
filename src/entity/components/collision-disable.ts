import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import * as Box2D from "@box2d/core";
import {TransmitterSet} from "src/entity/components/network/transmitting/transmitter-set";
import CollisionDisableTransmitter from "src/entity/components/network/collisions/collision-disable-transmitter";
import PhysicalComponent from "src/entity/components/physics-component";

export default class CollisionDisableComponent extends EventHandlerComponent {
    collisionsDisabled = false

    constructor() {
        super()
        this.eventHandler.on("physical-body-created", () => {
            this.updateSensor()
        })

        this.eventHandler.on("transmitter-set-added", (transmitterSet: TransmitterSet) => {
            transmitterSet.initializeTransmitter(CollisionDisableTransmitter)
        })
    }

    private updateSensor() {
        const body = this.entity.getComponent(PhysicalComponent).getBody()
        if(!body) return

        for(let fixture = body.GetFixtureList(); fixture; fixture = fixture.GetNext()) {
            fixture.SetSensor(this.collisionsDisabled)
        }
    }

    setCollisionsDisabled(collisionsDisabled: boolean) {
        if(collisionsDisabled === this.collisionsDisabled) return

        this.collisionsDisabled = collisionsDisabled
        this.updateSensor()

        this.entity.emit("collision-disable-toggled")
    }
}