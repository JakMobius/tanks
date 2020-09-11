
const AbstractEntity = require("../../entity/abstractentity")
const EntityDrawer = require("../graphics/drawers/entitydrawer")
const EntityModel = require("../../entity/entitymodel")

class ClientEntity extends AbstractEntity {

    static types = new Map()

    constructor(model) {

        super();

        /** @type EntityDrawer */
        this.drawer = null

        /** @type EntityModel */
        this.model = model
    }

    static fromModel(model) {
        let type = this.types.get(model.constructor)

        if(type) {
            return new type(model)
        }
        return null
    }

    /**
     * Associates client wrapper class with the bullet model
     * @param clientClass Client class to associate with bullet model
     * @param modelClass Bullet model
     */

    static associate(clientClass, modelClass) {
        this.types.set(modelClass, clientClass)
    }
}

module.exports = ClientEntity