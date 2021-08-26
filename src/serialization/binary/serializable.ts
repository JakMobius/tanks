
import BinarySerializationGroup from '../serialization-group';
import BinaryDecoder from "./binary-decoder";
import BinaryEncoder from "./binary-encoder";

export type Constructor<T> = { new (...args: any[]): T }

export class BinarySerializer {

    static BASE_GROUP_NAME = -1;
    static groups: BinarySerializationGroup[] = [];

    /**
     * Returns newly created or cached group object for the provided key.
     * @param key The key for group to be returned.
     * @returns Returns group for this key.
     */

    static getGroup(key: number): BinarySerializationGroup {
        let registry = this.groups[key];
        if(!registry) {
            registry = this.groups[key] = new BinarySerializationGroup();
        }

        return registry;
    }

    /**
     * Uses {@link fromBinary} method to deserialize instance from
     * binary data, returned by {@link serialize} function.
     * @param decoder The object to be deserialized
     * @param group The serialization group name. Can be either undefined, number or {@link BinarySerializable} subclass.
     * @returns The deserialized object or `null` if base class was not found.
     */

    static deserialize<C extends BinarySerializableStatic<C>>(decoder: BinaryDecoder, group?: Number | C): InstanceType<C> {

        let groupId: number;

        if(typeof group == "function") {
            groupId = (group as BinarySerializableStatic<any>).groupName;
        } else {
            groupId = BinarySerializer.BASE_GROUP_NAME
        }

        const type = decoder.readInt16()

        const clazz = this.getGroup(groupId).get<C>(type)
        if(!clazz) return null

        return clazz.fromBinary(decoder) as any as InstanceType<C>
    }

    /**
     * Uses {@link toBinary} method to serialize subclass instances to
     * object. Suitable for network transporting. Call {@link deserialize} to get exact
     * same object copy.
     * @param encoder where object serialization will be stored.
     * @param object to be serialized
     */

    static serialize<T extends BinarySerializableStatic<T>>(object: BinarySerializable<T>, encoder: BinaryEncoder): void {
        encoder.writeInt16((object.constructor as BinarySerializableStatic<T>).typeName)
        object.toBinary(encoder)
    }

    /**
     * Writes {@link BinarySerializable} subclass to internal registry. This
     * function should be used to deserialize your custom class with
     * {@link deserialize} static function.
     * @param clazz The class to register.
     */

    static register(clazz: BinarySerializableStatic<any>): void {
        let group = clazz.groupName;
        let registry = this.getGroup(group);
        return registry.register(clazz);
    }
}

// Oh gosh...

export interface BinarySerializableStatic<C extends BinarySerializableStatic<C>> extends BinaryCodableStatic<C> {

    /**
     * Used to separate different serialization groups.
     * @example
     * // If you are about to serialize both `Entity`
     * // and `Particle` classes, you would separate them
     * // in different groups. With that being done, you will be
     * // able to use same hardcoded type names for your entities
     * // and particles.
     *
     * class Entity extends BinarySerializable<typeof Entity> {
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
     * class Particle extends BinarySerializable<typeof Particle> {
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
     */

    readonly groupName: number

    /**
     * Type identifier for specific {@link BinarySerializable} subclass.
     * should fit Int16 (-32,768 to +32,767)
     */
    readonly typeName: number
}

export interface BinaryCodableStatic<C extends BinaryCodableStatic<C>> extends Constructor<BinaryCodable<C>> {
    /**
     * To serialize and deserialize the base class instances, use
     * {@link serialize} and {@link deserialize} static functions.
     * @param decoder The {@link BinaryDecoder} which contains source object data.
     * @returns The deserialized object
     */

    fromBinary<T extends BinaryCodable<C>>(this: Constructor<T>, decoder: BinaryDecoder): T;
}

/**
 * This interface allows to serialize and deserialize any object
 * into binary data. Subclasses should implement {@link toBinary},
 * {@link fromBinary} methods and static {@link typeName} function.
 * Separation between serialization groups is done by overriding
 * static {@link groupName} method. This class should never
 * be constructed directly.
 * Refer to the documentation of the appropriate methods.
 */

export interface BinarySerializable<C extends BinarySerializableStatic<C>> extends BinaryCodable<C> {}

export interface BinaryEncodable {
    /**
     * To serialize and deserialize subclass instances, use
     * {@link serialize} and {@link deserialize} static
     * functions. This function should never be called on {@link BinarySerializable} class.
     * @param encoder The encoder which will store object data
     */

    toBinary(encoder: BinaryEncoder): void
}

export interface BinaryDecodable<T extends BinaryCodableStatic<T>> {}
export type BinaryCodable<T extends BinaryCodableStatic<T>> = BinaryEncodable & BinaryDecodable<T>

export default BinarySerializable;