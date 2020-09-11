
const AbstractEffect = require("/src/effects/abstracteffect")

class ServerEffect extends AbstractEffect {

    static shouldSynchroniseRemoval = true

    /**
     * Finds server-side implementation of the effect model
     * @param model {EffectModel}
     * @returns {ServerEffect}
     */
    static fromModel(model) {
        let clazz = /** @type Class<ServerEffect> */ this.Types.get(model.constructor)

        if(clazz) return new clazz(model)
        return null
    }
}

module.exports = ServerEffect