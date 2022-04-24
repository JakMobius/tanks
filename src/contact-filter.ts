import * as Box2D from './library/box2d'
import {b2Fixture} from "./library/box2d/dynamics/b2_fixture";
import EntityModel from "./entity/entity-model";

export default class GameWorldContactFilter extends Box2D.ContactFilter {

    ShouldCollide(fixtureA: b2Fixture, fixtureB: b2Fixture): boolean {
        if(!super.ShouldCollide(fixtureA, fixtureB)) return false

        const bodyA = fixtureA.GetBody()
        const bodyB = fixtureB.GetBody()
        const dataA = bodyA.GetUserData()
        const dataB = bodyB.GetUserData()

        if(dataA instanceof EntityModel) {
            if(!dataA.emit("should-collide", bodyB)) return false
        }

        if(dataB instanceof EntityModel) {
            if(!dataB.emit("should-collide", bodyA)) return false
        }

        return true
    }
}