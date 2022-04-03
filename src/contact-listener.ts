import * as Box2D from "./library/box2d";
import {b2Contact} from "./library/box2d/dynamics/b2_contact";
import AbstractWorld from "./abstract-world";
import EntityModel from "./entity/entity-model";
import PhysicalComponent from "./entity/physics-component";
import Entity from "./utils/ecs/entity";

/**
 * This class handles collision events and tells the appropriate
 * entities that they have collided with something else
 */
export default class GameWorldContactListener extends Box2D.ContactListener {


    constructor(world: AbstractWorld) {
        super();
    }

    BeginContact(contact: b2Contact) {
        const worldManifold = new Box2D.WorldManifold()
        contact.GetWorldManifold(worldManifold)

        const bodyA = contact.GetFixtureA().GetBody()
        const bodyB = contact.GetFixtureB().GetBody()

        if(!bodyA.GetWorld() || !bodyB.GetWorld()) return

        const dataA = bodyA.GetUserData()
        const dataB = bodyB.GetUserData()

        if(dataA instanceof EntityModel) {
            dataA.entity.onBodyHit(bodyB, contact)
        }

        if(dataB instanceof EntityModel) {
            dataB.entity.onBodyHit(bodyA, contact)
        }
    }
}