
import AbstractEntity from '../../entity/abstractentity';
import EntityDrawer from '../graphics/drawers/entitydrawer';
import EntityModel from '../../entity/entitymodel';

class ClientEntity extends AbstractEntity {
	public drawer: any;
	public types: any;
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

export default ClientEntity;