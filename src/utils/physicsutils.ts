import * as Box2D from '../library/box2d';

class PhysicsUtils {
    static createFixture(shape: Box2D.Shape, fixture?: Partial<Box2D.IFixtureDef>): Box2D.IFixtureDef {
        if(!fixture) fixture = {}

        fixture.friction = fixture.friction || 0.3
        fixture.density = fixture.density || 1
        fixture.restitution = fixture.restitution || 0;
        fixture.shape = shape

        return fixture as Box2D.IFixtureDef
    }

    static dynamicBody(world: Box2D.World, options?: Partial<Box2D.IBodyDef>) {
        options = options || {}
        options.type = options.type || Box2D.dynamicBody;

        return world.CreateBody(options);
    }

    static squareFixture(width: number, height: number, offset?: Box2D.XY, options?: Partial<Box2D.IFixtureDef>): Box2D.IFixtureDef {
        if(!offset) offset = { x: 0, y: 0 }

        const shape = new Box2D.PolygonShape()
        shape.SetAsBox(width, height, offset, 0)

        return this.createFixture(shape, options)
    }

    static horizontalSquareFixtures(width: number, height: number, offset: Box2D.XY, options?: Partial<Box2D.IFixtureDef>) {
        return [
            this.squareFixture(width, height, new Box2D.Vec2(-offset.x, offset.y), options),
            this.squareFixture(width, height, new Box2D.Vec2(offset.x, offset.y), options)
        ]
    }

    static vertexFixture(vertexArray: Box2D.XY[], options?: Partial<Box2D.IFixtureDef>) {
        const shape = new Box2D.PolygonShape();
        shape.Set(vertexArray)

        return this.createFixture(shape, options)
    }
}

export default PhysicsUtils;