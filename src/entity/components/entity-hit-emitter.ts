import * as Box2D from "@box2d/core";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import { getObjectFromBody } from "../physical-body-data";

export default class EntityHitEmitter extends EventHandlerComponent {
    constructor() {
        super()
        this.eventHandler.on("physical-contact-begin", (body, contact) => {
            this.onBodyHit(body, contact)
        })
    }

    onBodyHit(body: Box2D.b2Body, contact: Box2D.b2Contact) {
        const data = getObjectFromBody(body)

        if(data.entity?.deref()) {
            this.entity.emit("entity-hit", data.entity.deref(), contact)
        }
    }
}