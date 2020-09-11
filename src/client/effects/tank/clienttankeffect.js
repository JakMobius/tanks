
const ClientEffect = require("../clienteffect")

class ClientTankEffect extends ClientEffect {

    /**
     * @param model {EffectModel}
     * @param tank {ClientTank}
     */
    constructor(model, tank) {
        super(model)
        this.model = model
        this.tank = tank
    }

    // noinspection JSCheckFunctionSignatures
    /**
     * @param model {EffectModel}
     * @param tank {ClientTank}
     * @returns {ClientEffect | null}
     */
    static fromModel(model, tank) {
        let clazz = this.Types.get(model.constructor)
        if(!clazz) return null
        return /** @type ClientEffect */ new clazz(model, tank)
    }
}

module.exports = ClientTankEffect