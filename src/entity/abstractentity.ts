
import EntityModel from './entitymodel';

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

export default AbstractEntity;