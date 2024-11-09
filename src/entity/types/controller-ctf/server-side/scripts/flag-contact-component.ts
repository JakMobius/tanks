import {b2Body} from "src/library/box2d/dynamics/b2_body";
import {FlagDataComponent} from "src/entity/types/controller-ctf/server-side/scripts/flag-data-component";
import * as Box2D from "src/library/box2d";
import PhysicsChunk from "src/physics/physics-chunk";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import PhysicalComponent from "src/entity/components/physics-component";

export default class FlagContactComponent extends EventHandlerComponent {

    constructor() {
        super()
        this.eventHandler.on("physical-contact-begin", (body) => this.onContactBegin(body))
        this.eventHandler.on("physical-contact-end", (body) => this.onContactEnd(body))

        this.eventHandler.on("physical-contact-pre-solve", (body: Box2D.Body, contact: Box2D.Contact) => {
            if(PhysicsChunk.getFromBody(body)) return
            contact.SetEnabled(false)
        })
    }

    private onContactBegin(body: b2Body) {
        const flagState = this.entity.getComponent(FlagDataComponent)

        const entity = PhysicalComponent.getEntityFromBody(body)
        if(!entity) return
        if(flagState.addContact(entity) > 1) return

        this.entity.emit("flag-contact", entity)
    }

    private onContactEnd(body: b2Body) {
        const flagState = this.entity.getComponent(FlagDataComponent)

        const entity = PhysicalComponent.getEntityFromBody(body)
        if(!entity) return
        flagState.removeContact(entity)
    }
}