
const EntityModel = require("./entitymodel")

class AbstractEntity {
    /**
     * @type EntityModel
     */

    model = null

    constructor(model) {
        this.model = model
    }

    tick(dt) {
        this.model.tick(dt)
    }
}

module.exports = AbstractEntity