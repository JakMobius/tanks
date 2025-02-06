import * as Box2D from "@box2d/core";

export default class PhysicsUtils {
    static createFixture(shape: Box2D.b2Shape, fixture?: Partial<Box2D.b2FixtureDef>): Box2D.b2FixtureDef {
        if(!fixture) fixture = {}

        fixture.friction = fixture.friction || 0.3
        fixture.density = fixture.density || 1
        fixture.restitution = fixture.restitution || 0;
        fixture.shape = shape

        return fixture as Box2D.b2FixtureDef
    }

    static dynamicBody(world: Box2D.b2World, options?: Partial<Box2D.b2BodyDef>) {
        options = options || {}
        options.type = options.type || Box2D.b2BodyType.b2_dynamicBody;

        return world.CreateBody(options);
    }

    static squareFixture(width: number, height: number, offset?: Box2D.XY, options?: Partial<Box2D.b2FixtureDef>): Box2D.b2FixtureDef {
        if(!offset) offset = { x: 0, y: 0 }

        const shape = new Box2D.b2PolygonShape()
        shape.SetAsBox(width, height, offset, 0)

        return this.createFixture(shape, options)
    }

    static horizontalSquareFixtures(width: number, height: number, offset: Box2D.XY, options?: Partial<Box2D.b2FixtureDef>) {
        return [
            this.squareFixture(width, height, new Box2D.b2Vec2(-offset.x, offset.y), Object.assign({}, options)),
            this.squareFixture(width, height, new Box2D.b2Vec2(offset.x, offset.y), Object.assign({}, options))
        ]
    }

    static vertexFixture(vertexArray: Box2D.XY[], options?: Partial<Box2D.b2FixtureDef>) {
        const shape = new Box2D.b2PolygonShape();
        shape.Set(vertexArray)

        return this.createFixture(shape, options)
    }
}