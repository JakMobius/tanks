import * as Box2D from "@box2d/core";
import Entity from "./utils/ecs/entity";
import { getObjectFromBody } from "./entity/physical-body-data";

/**
 * This class handles collision events and tells the
 * entities that they have collided with something else
 */
export default class GameWorldContactListener extends Box2D.b2ContactListener {

    private emitContact(contact: Box2D.b2Contact, event: string, ...args: any[]) {
        const worldManifold = new Box2D.b2WorldManifold()
        contact.GetWorldManifold(worldManifold)

        const bodyA = contact.GetFixtureA().GetBody()
        const bodyB = contact.GetFixtureB().GetBody()

        if(!bodyA.GetWorld() || !bodyB.GetWorld()) return

        const entityA = getObjectFromBody(bodyA).entity?.deref()
        const entityB = getObjectFromBody(bodyB).entity?.deref()

        if(entityA) {
            entityA.emit(event, bodyB, contact, ...args)
        }

        if(entityB) {
            entityB.emit(event, bodyA, contact, ...args)
        }
    }

    PreSolve(contact: Box2D.b2Contact, oldManifold: Box2D.b2Manifold) {
        this.emitContact(contact, "physical-contact-pre-solve", oldManifold)
    }

    PostSolve(contact: Box2D.b2Contact, impulse: Box2D.b2ContactImpulse) {
        this.emitContact(contact, "physical-contact-post-solve", impulse)
    }

    BeginContact(contact: Box2D.b2Contact) {
        this.emitContact(contact, "physical-contact-begin")
    }

    EndContact(contact: Box2D.b2Contact) {
        this.emitContact(contact, "physical-contact-end")
    }
}