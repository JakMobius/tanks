const Box2D = require("../library/box2d")

class PhysicsUtils {
    static createFixture(options) {
        if(!options) options = {}

        const fixture = new Box2D.b2FixtureDef;
        fixture.friction = options.friction || 0.3
        fixture.density = options.density || 1
        fixture.restitution = options.restitution || 0;

        return fixture
    }

    static squareFixture(width, height, offset, options) {
        if(!offset) {
            offset = new Box2D.b2Vec2(0, 0)
        }

        const shape = new Box2D.b2PolygonShape
        shape.SetAsOrientedBox(width, height, offset, 0)

        const fixture = this.createFixture(options)
        fixture.shape = shape

        return fixture
    }

    static horizontalSquareFixtures(width, height, offset, options) {
        return [
            this.squareFixture(width, height, new Box2D.b2Vec2(-offset.x, offset.y), options),
            this.squareFixture(width, height, new Box2D.b2Vec2(offset.x, offset.y), options)
        ]
    }

    static dynamicBody(world, options) {
        options = options || {}
        const bodyDef = new Box2D.b2BodyDef;
        bodyDef.type = Box2D.b2Body.b2_dynamicBody;

        let body = world.CreateBody(bodyDef);

        body.SetLinearDamping(options.linearDamping || 1.0)
        body.SetAngularDamping(options.angularDamping || 8.0)

        return body
    }

    static vertexFixture(vertexArray, options) {
        const shape = new Box2D.b2PolygonShape;
        shape.SetAsArray(vertexArray)
        const fixture = this.createFixture(options)
        fixture.shape = shape
        return fixture
    }

    static setupPhysics() {
        Box2D.b2Settings.b2_maxTranslation = 20
        Box2D.b2Settings.b2_maxTranslationSquared = 4000
    }
}

module.exports = PhysicsUtils