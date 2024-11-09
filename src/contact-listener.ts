import * as Box2D from "./library/box2d";
import {b2Contact} from "./library/box2d/dynamics/b2_contact";
import Entity from "./utils/ecs/entity";
import {b2Manifold} from "src/library/box2d/collision/b2_collision";
import {b2ContactImpulse} from "src/library/box2d/dynamics/b2_world_callbacks";
import PhysicalComponent from "src/entity/components/physics-component";

/**
 * This class handles collision events and tells the
 * entities that they have collided with something else
 */
export default class GameWorldContactListener extends Box2D.ContactListener {

    private emitContact(contact: b2Contact, event: string, ...args: any[]) {
        const worldManifold = new Box2D.WorldManifold()
        contact.GetWorldManifold(worldManifold)

        const bodyA = contact.GetFixtureA().GetBody()
        const bodyB = contact.GetFixtureB().GetBody()

        if(!bodyA.GetWorld() || !bodyB.GetWorld()) return

        const dataA = PhysicalComponent.getEntityFromBody(bodyA)
        const dataB = PhysicalComponent.getEntityFromBody(bodyB)

        if(dataA instanceof Entity) {
            dataA.emit(event, bodyB, contact, ...args)
        }

        if(dataB instanceof Entity) {
            dataB.emit(event, bodyA, contact, ...args)
        }
    }

    PreSolve(contact: b2Contact, oldManifold: b2Manifold) {
        this.emitContact(contact, "physical-contact-pre-solve", oldManifold)
    }

    PostSolve(contact: b2Contact, impulse: b2ContactImpulse) {
        this.emitContact(contact, "physical-contact-post-solve", impulse)
    }

    BeginContact(contact: b2Contact) {
        this.emitContact(contact, "physical-contact-begin")
    }

    EndContact(contact: b2Contact) {
        this.emitContact(contact, "physical-contact-end")
    }
}