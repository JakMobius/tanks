/**
 * @abstract
 */
class BuilderAction {
    /**
     * @abstract
     * @param config
     */
    static validateConfig(config) {

    }

    /**
     * @abstract
     * @param config
     */
    static getDependencies(config) {

    }

    /**
     * @abstract
     * @param config
     */
    static getTargets(config, ignoreUnnamed) {

    }

    /**
     * @abstract
     * @param config
     */
    static async perform(config, builder, schemeCache, schemeName) {

    }

    /**
     * @abstract
     */
    static getName() {

    }

    static validateTargetOutputField(config) {
        if (!config["target-name"]) {
            throw new Error("block does not contain 'target-name' field")
        }
        if (typeof config["target-name"] != "string") {
            throw new Error("'target-name' field is not a string")
        }
    }

    static getTargetField(config) {
        return config["target-name"]
    }
}

module.exports = BuilderAction