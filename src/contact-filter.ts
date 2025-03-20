import * as Box2D from '@box2d/core'
import { getObjectFromBody } from './entity/physical-body-data';

export default class GameWorldContactFilter extends Box2D.b2ContactFilter {

    ShouldCollide(fixtureA: Box2D.b2Fixture, fixtureB: Box2D.b2Fixture): boolean {
        if(!super.ShouldCollide(fixtureA, fixtureB)) return false

        const bodyA = fixtureA.GetBody()
        const bodyB = fixtureB.GetBody()
        const entityA = getObjectFromBody(bodyA).entity?.deref()
        const entityB = getObjectFromBody(bodyB).entity?.deref()

        if(entityA) {
            if(!entityA.emit("should-collide", bodyB)) return false
        }

        if(entityB) {
            if(!entityB.emit("should-collide", bodyA)) return false
        }

        return true
    }
}