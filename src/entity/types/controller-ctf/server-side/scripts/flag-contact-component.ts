import {FlagStateComponent} from "src/entity/types/controller-ctf/server-side/scripts/flag-state-component";
import * as Box2D from "@box2d/core";
import PhysicsChunk from "src/physics/physics-chunk";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import { getObjectFromBody } from "src/entity/physical-body-data";

export default class FlagContactComponent extends EventHandlerComponent {

    constructor() {
        super()
        this.eventHandler.on("physical-contact-begin", (body) => this.onContactBegin(body))
        this.eventHandler.on("physical-contact-end", (body) => this.onContactEnd(body))

        this.eventHandler.on("physical-contact-pre-solve", (body: Box2D.b2Body, contact: Box2D.b2Contact) => {
            if(PhysicsChunk.getFromBody(body)) return
            contact.SetEnabled(false)
        })
    }

    private onContactBegin(body: Box2D.b2Body) {
        const flagState = this.entity.getComponent(FlagStateComponent)

        const entity = getObjectFromBody(body)?.entity?.deref()        
        if(!entity) return
        if(flagState.addContact(entity) > 1) return

        this.entity.emit("flag-contact", entity)
    }

    private onContactEnd(body: Box2D.b2Body) {
        const flagState = this.entity.getComponent(FlagStateComponent)

        const entity = getObjectFromBody(body)?.entity?.deref()
        if(!entity) return
        flagState.removeContact(entity)
    }
}