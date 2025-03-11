import * as Box2D from "@box2d/core";
import { b2ScaledPolygonShape } from "src/physics/b2-scale-shape";

export default class PhysicsUtils {
    static createFixture(shape: Box2D.b2Shape, fixture?: Partial<Box2D.b2FixtureDef>): Box2D.b2FixtureDef {
        return {
            friction: 0.3,
            density: 1,
            restitution: 0,
            shape,
            ...(fixture ?? {}),
        } as Box2D.b2FixtureDef
    }

    static dynamicBody(world: Box2D.b2World, options?: Partial<Box2D.b2BodyDef>) {
        options = {
            type: Box2D.b2BodyType.b2_dynamicBody,
            ...(options ?? {})
        }

        return world.CreateBody(options);
    }

    static squareFixture(width: number, height: number, offset?: Box2D.XY, options?: Partial<Box2D.b2FixtureDef>): Box2D.b2FixtureDef {
        if(!offset) offset = { x: 0, y: 0 }

        const shape = new b2ScaledPolygonShape()
        shape.SetAsBox(width, height, offset, 0)

        return this.createFixture(shape, options)
    }

    static horizontalSquareFixtures(width: number, height: number, offset: Box2D.XY, options?: Partial<Box2D.b2FixtureDef>) {
        return [
            this.squareFixture(width, height, { x: offset.x, y: -offset.y }, options),
            this.squareFixture(width, height, { x: offset.x, y: offset.y }, options)
        ]
    }

    static vertexFixture(vertexArray: Box2D.XY[], options?: Partial<Box2D.b2FixtureDef>) {
        const shape = new b2ScaledPolygonShape();
        shape.Set(vertexArray)

        return this.createFixture(shape, options)
    }
}