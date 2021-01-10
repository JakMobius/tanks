
import AbstractEntity from '../../entity/abstractentity';
import EntityDrawer from '../graphics/drawers/entitydrawer';
import EntityModel from '../../entity/entitymodel';

class ClientEntity extends AbstractEntity {
	public drawer: EntityDrawer = null;
	static types = new Map<typeof EntityModel, typeof ClientEntity>()

    constructor(model: EntityModel) {
        super(model);
    }

    static fromModel(model: EntityModel) {
        let type = this.types.get(model.constructor as typeof EntityModel)

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

    static associate(clientClass: typeof ClientEntity, modelClass: typeof EntityModel) {
        this.types.set(modelClass, clientClass)
    }
}

export default ClientEntity;