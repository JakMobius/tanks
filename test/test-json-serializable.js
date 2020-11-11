const JsonSerializable = require("../src/serialization/json/serializable")
const mocha = require("mocha")
const chai = require("chai")

const assert = chai.assert
const describe = mocha.describe
const it = mocha.it
const before = mocha.before

// Declaring entity class. This data will
// be transferred over our virtual
// pipeline.

class Entity extends JsonSerializable {
    static groupName = () => 1;
    static typeName = () => 0;

    constructor(options) {
        if(!options) options = {}
        super();
        this.health = options.health
    }

    toJson() {
        return {
            health: this.health
        }
    }

    updateState(json) {
        this.health = json.health
    }

    static fromJson(json) {
        let entity = new this();
        entity.updateState(json)
        return entity
    }
}

// There are different types of entities

class Fireball extends Entity {
    static typeName = () => 1;

    constructor(options) {
        if(!options) options = {}
        super(options);
        this.damage = options.damage
    }

    toJson() {
        // Letting superclass write its own parameters
        let object = super.toJson()
        // Adding self parameters
        object.damage = this.damage
        return object
    }

    updateState(json) {
        // Letting superclass read its own parameters
        super.updateState(json);
        // Reading self parameters
        this.damage = json.damage
    }
}

// All the same

class SizedFireball extends Fireball {
    static typeName = () => 2;

    constructor(options) {
        if(!options) options = {}
        super(options);
        this.size = options.size
    }

    toJson() {
        let object = super.toJson()
        object.size = this.size
        return object
    }

    updateState(json) {
        super.updateState(json);
        this.size = json.size
    }
}

describe("JsonSerializable class", function () {

    before('register classes', function () {
        JsonSerializable.register(Entity)
        JsonSerializable.register(Fireball)
        JsonSerializable.register(SizedFireball)
    })

    it('should transfer and update objects', function () {
        let entity = new Entity({
            health: 1
        })
        let serializedEntity = JsonSerializable.serialize(entity)
        let deserializedEntity = JsonSerializable.deserialize(serializedEntity, Entity)

        assert.isNotNull(deserializedEntity, "Deserialized object is nil")
        assert.strictEqual(entity.health, deserializedEntity.health, "Deserialized object is corrupted")

        entity.health = 2
        deserializedEntity.updateState(JsonSerializable.serialize(entity))

        assert.isNotNull(deserializedEntity, "Updated object is nil")
        assert.strictEqual(entity.health, deserializedEntity.health, "Updated object is corrupted")
    });

    it('should determine subclasses', function() {
        let fireball = new SizedFireball({
            health: 3,
            damage: 1.5
        })
        let serializedFireball = JsonSerializable.serialize(fireball)
        let deserializedFireball = JsonSerializable.deserialize(serializedFireball, Entity)

        assert.isNotNull(deserializedFireball, "Deserialized object is nil")
        assert.instanceOf(deserializedFireball, SizedFireball, "Deserialized object have wrong type")
        assert.deepEqual(deserializedFireball, fireball, "Deserialized object is corrupted")
    })
})