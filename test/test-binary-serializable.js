
const BinarySerializable = require("../src/serialization/binary/serializable")
const BinaryEncoder = require("../src/legacy/serialization-v0001/binary/binary-encoder")
const BinaryDecoder = require("../src/legacy/serialization-v0001/binary/binary-decoder")
const mocha = require("mocha")
const chai = require("chai")

const assert = chai.assert
const describe = mocha.describe
const it = mocha.it
const before = mocha.before
const after = mocha.after
const beforeEach = mocha.beforeEach

// Declaring entity class. This data will
// be transferred over our virtual
// pipeline.

class Entity extends BinarySerializable {
    static groupName = () => 1;
    static typeName = () => 0;

    constructor(options) {
        if(!options) options = {}
        super();
        this.health = options.health
    }

    toBinary(encoder) {
        encoder.writeFloat32(this.health)
    }

    updateState(decoder) {
        this.health = decoder.readFloat32()
    }

    static fromBinary(decoder) {
        let entity = new this();
        entity.updateState(decoder)
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

    toBinary(encoder) {
        // Letting superclass write its own parameters
        super.toBinary(encoder)
        // Adding self parameters
        encoder.writeFloat32(this.damage)
    }

    updateState(decoder) {
        // Letting superclass read its own parameters
        super.updateState(decoder);
        // Reading self parameters
        this.damage = decoder.readFloat32()
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

    toBinary(encoder) {
        super.toBinary(encoder)
        encoder.writeUint16(this.size)
    }

    updateState(decoder) {
        super.updateState(decoder);
        this.size = decoder.readUint16()
    }
}

describe("BinarySerializable class", function () {

    before('register classes', function () {
        BinarySerializable.register(Entity)
        BinarySerializable.register(Fireball)
        BinarySerializable.register(SizedFireball)
    })

    it('should transfer and update objects', function () {
        let entity = new Entity({
            health: 1
        })
        let binaryEncoder = new BinaryEncoder()
        BinarySerializable.serialize(entity, binaryEncoder)

        let binaryDecoder = new BinaryDecoder()
        binaryDecoder.readData(binaryEncoder.compile())

        let deserializedEntity = BinarySerializable.deserialize(binaryDecoder, Entity)

        assert.isNotNull(deserializedEntity, "Deserialized object is nil")
        assert.strictEqual(entity.health, deserializedEntity.health, "Deserialized object is corrupted")

        entity.health = 2
        binaryEncoder.reset()
        BinarySerializable.serialize(entity, binaryEncoder)

        binaryDecoder.readData(binaryEncoder.compile())

        deserializedEntity.updateState(binaryDecoder)

        assert.isNotNull(deserializedEntity, "Updated object is nil")
        assert.strictEqual(entity.health, deserializedEntity.health, "Updated object is corrupted")
    });

    it('should determine subclasses', function() {
        let fireball = new SizedFireball({
            health: 3,
            damage: 1.5,
            size: 8
        })

        let binaryEncoder = new BinaryEncoder()
        let serializedFireball = BinarySerializable.serialize(fireball, binaryEncoder)

        let binaryDecoder = new BinaryDecoder()
        binaryDecoder.readData(binaryEncoder.compile())

        let deserializedFireball = BinarySerializable.deserialize(binaryDecoder, Entity)

        assert.isNotNull(deserializedFireball, "Deserialized object is nil")
        assert.instanceOf(deserializedFireball, SizedFireball, "Deserialized object have wrong type")
        assert.deepEqual(deserializedFireball, fireball, "Deserialized object is corrupted")
    })
})