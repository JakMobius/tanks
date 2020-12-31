
import Group from '../serializationgroup';

/**
 * This abstract class provides functionality to easily serialize and
 * deserialize any object. When subclassing, you should
 * override `toJson` and `fromJson` methods, and should have static
 * function `typeName` returning integer. Separation between
 * serialization groups should is done by creating static `groupName`
 * method returning number of group.
 * Refer to the documentation of the appropriate methods.
 */

class JsonSerializable {
	public JSON_TYPE_KEY: any;
    static JSON_TYPE_KEY = "t";
    static BASE_GROUP_NAME = -1;
    static groups = [];

    /**
     * Creates or returns cached group object for the provided key.
     * @param key The key for group to be returned.
     * @returns {Group} Returns group for this key.
     */

    static getGroup(key) {
        let registry = JsonSerializable.groups[key];
        if(!registry) {
            registry = JsonSerializable.groups[key] = new Group();
        }

        return registry;
    }

    /**
     * To serialize and deserialize subclass instances, use
     * `serialize` and `deserialize` static
     * functions. Should never be called on `JsonSerializable` class.
     * @returns Map object representing current object.
     */

    toJson() {
        throw new Error("Abstract class instancing is illegal")
    }

    /**
     * To serialize and deserialize the base class instances, use
     * `serialize` and `deserialize` static functions.
     * @param {Map} json The JSON object returned by `toJson` method.
     * @returns {JsonSerializable} JsonSerializable by its serialization
     */

    static fromJson(json) {
        throw new Error("Abstract class instancing is illegal")
    }

    /**
     * Uses `toJson` method to serialize subclass instances to
     * object. Suitable for `JSON.stringify` and through-network
     * transporting. Call `deserialize` to get exact
     * same object copy.
     * @param object
     * @returns {string} The object serialized to object.
     */

    static serialize(object) {
        if(object.constructor["name"] === JsonSerializable.constructor["name"]) {
            throw new Error(`Cannot serialize abstract class.`)
        }
        let json = object.toJson()
        json[this.JSON_TYPE_KEY] = object.constructor.typeName()
        return json
    }

    /**
     * Uses `fromJson` method to deserialize instance from
     * object, returned by `serialize` function.
     * @param {Object} json The object to be deserialized
     * @param group {Number|Class} The serialization group name. Can be either undefined, number or `JsonSerializable` subclass.
     * @returns {JsonSerializable} The deserialized object or `null` if base class was not found.
     */

    static deserialize(json, group) {
        if(typeof group == "function") {
            if(group.prototype instanceof JsonSerializable) {
                group = group.groupName();
            } else {
                throw new Error("Illegal argument: second argument must be either undefined, number or 'JsonSerializable' subclass.")
            }
        } else if(group === undefined) {
            group = JsonSerializable.BASE_GROUP_NAME
        } else if(typeof group != "number") {
            throw new Error("Illegal argument: second argument must be either undefined, number or 'JsonSerializable' subclass.")
        }

        const type = json[JsonSerializable.JSON_TYPE_KEY]

        const clazz = this.getGroup(group).get(type)
        if(!clazz) {
            return null
        }
        return clazz.fromJson(json)
    }

    /**
     * Each registered subclass should have a type,
     * identifier to be deserialized. The type identifier should be
     * unique and as short as possible to reduce the network load.
     * This function should never be called on `JsonSerializable` class
     * @returns Type identifier for specific JsonSerializable
     * subclass.
     */

    static typeName() {
        throw new Error(`Abstract class does not have type name.`)
    }

    /**
     * Used to separate different serialization groups.
     * As example: If you are about to serialize both `Entity`
     * and `Particle` classes, you would separate them
     * in different groups. With that being done, you will be
     * able to use same hardcoded type names for your entities
     * and particles.
     * @returns {number} Group name as unique number.
     */

    static groupName() {
        return JsonSerializable.BASE_GROUP_NAME;
    }

    /**
     * Registers subclass in the registry. This
     * function should be called if you want to deserialize your
     * custom class with `deserialize` static function.
     * Provided class should have static function `typeName`
     * @param {Class} clazz The class to register.
     */

    static register(clazz) {
        let group = clazz.groupName();
        let registry = this.getGroup(group);
        return registry.register(clazz);
    }

    /**
     * Updates instance state to make it consistent
     * with new state. Useful to transfer object states
     * over network.
     * @param json New state for object
     */

    updateState(json) {
        throw new Error("Abstract class instancing is illegal")
    }
}

export default JsonSerializable;