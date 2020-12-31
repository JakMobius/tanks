
import Group from '../serializationgroup';
import Logger from '../../server/log/logger';

/**
 * @abstract
 * This abstract class allows to serialize and deserialize any object
 * into binary data. Subclasses should implement {@link toBinary},
 * {@link fromBinary} methods and static {@link typeName} function.
 * Separation between serialization groups is done by overriding
 * static {@link groupName} method. This class should never
 * be constructed directly.
 * Refer to the documentation of the appropriate methods.
 */

class BinarySerializable {
    static BASE_GROUP_NAME = -1;
    static groups = [];

    /**
     * Returns newly created or cached group object for the provided key.
     * @param key The key for group to be returned.
     * @returns {Group} Returns group for this key.
     */

    static getGroup(key) {
        let registry = BinarySerializable.groups[key];
        if(!registry) {
            registry = BinarySerializable.groups[key] = new Group();
        }

        return registry;
    }

    /**
     * @abstract
     * To serialize and deserialize subclass instances, use
     * {@link serialize} and {@link deserialize} static
     * functions. This function should never be called on {@link BinarySerializable} class.
     * @param {BinaryEncoder} encoder The encoder which will store object data
     */

    toBinary(encoder) {
        throw new Error("Abstract class instancing is illegal")
    }

    /**
     * @abstract
     * To serialize and deserialize the base class instances, use
     * {@link serialize} and {@link deserialize} static functions.
     * @param {BinaryDecoder} decoder The {@link BinaryDecoder} which contains source object data.
     * @returns {BinarySerializable} The deserialized object
     */

    static fromBinary(decoder) {
        throw new Error("Abstract class instancing is illegal")
    }

    /**
     * Uses {@link toBinary} method to serialize subclass instances to
     * object. Suitable for network transporting. Call {@link deserialize} to get exact
     * same object copy.
     * @param {BinaryEncoder} encoder where object serialization will be stored.
     * @param {BinarySerializable} object to be serialized
     */

    static serialize(object, encoder) {
        if(object.constructor["name"] === BinarySerializable.constructor["name"]) {
            throw new Error(`Cannot serialize abstract class.`)
        }
        encoder.writeInt16(object.constructor.typeName())
        object.toBinary(encoder)
    }

    /**
     * Uses {@link fromBinary} method to deserialize instance from
     * binary data, returned by {@link serialize} function.
     * @param {BinaryDecoder} decoder The object to be deserialized
     * @param group {Number|Class} The serialization group name. Can be either undefined, number or {@link BinarySerializable} subclass.
     * @returns {BinarySerializable} The deserialized object or `null` if base class was not found.
     */

    static deserialize(decoder, group) {
        if(typeof group == "function") {
            if(group.prototype instanceof BinarySerializable) {
                group = group.groupName();
            } else {
                throw new Error("Illegal argument: second argument must be either undefined, number or 'BinarySerializable' subclass.")
            }
        } else if(group === undefined) {
            group = BinarySerializable.BASE_GROUP_NAME
        } else if(typeof group != "number") {
            throw new Error("Illegal argument: second argument must be either undefined, number or 'BinarySerializable' subclass.")
        }

        const type = decoder.readInt16()

        const clazz = this.getGroup(group).get(type)
        if(!clazz) {
            return null
        }
        return clazz.fromBinary(decoder)
    }

    /**
     * @abstract
     * Each registered subclass should have a type identifier to be
     * deserialized. Return value should fit Int16 (-32,768 to +32,767)
     * This function should never be called on {@link BinarySerializable} class instance
     * @returns {number} Type identifier for specific {@link BinarySerializable}
     * subclass.
     */

    static typeName() {
        throw new Error(`Abstract class does not have type name.`)
    }

    /**
     * Used to separate different serialization groups.
     * @example
     * // If you are about to serialize both `Entity`
     * // and `Particle` classes, you would separate them
     * // in different groups. With that being done, you will be
     * // able to use same hardcoded type names for your entities
     * // and particles.
     *
     * class Entity extends BinarySerializable {
     *     static groupName() { return 1 } // Using group named "1" for entities
     * }
     *
     * class Projectile extends Entity {
     *     static typeName() { return 1 }
     * }
     * BinarySerializable.register(Projectile) // Don't forget to register class
     *
     * class Animal extends Entity {
     *     static typeName() { return 2 }
     * }
     * BinarySerializable.register(Animal)
     *
     *
     * // Using separate group to serialize particles
     *
     * class Particle extends BinarySerializable {
     *     static groupName() { return 2 } // Using group named "2" for particles
     * }
     *
     * class FireParticle extends Particle {
     *     static typeName() { return 1 }
     * }
     * BinarySerializable.register(FireParticle)
     *
     * class ExplodeParticle extends Particle {
     *     static typeName() { return 2 }
     * }
     * BinarySerializable.register(ExplodeParticle)
     *
     * @returns {number} Group name as unique number.
     */

    static groupName() {
        return BinarySerializable.BASE_GROUP_NAME;
    }

    /**
     * Writes {@link BinarySerializable} subclass to internal registry. This
     * function should be used to deserialize your custom class with
     * {@link deserialize} static function.
     * @param {Class<BinarySerializable>} clazz The class to register.
     */

    static register(clazz) {
        let group = clazz.groupName();
        let registry = this.getGroup(group);
        return registry.register(clazz);
    }
}

export default BinarySerializable;