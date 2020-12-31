import ClientEffect from '../clienteffect';

class ClientWorldEffect extends ClientEffect {
	public model: any;
	public world: any;
	public Types: any;

    /**
     * @param model {WorldEffectModel}
     * @param world {ClientGameWorld}
     */
    constructor(model, world) {
        super(model)
        this.model = model
        this.world = world
    }

    // noinspection JSCheckFunctionSignatures
    /**
     * @param model {WorldEffectModel}
     * @param world {ClientGameWorld}
     * @returns {ClientWorldEffect | null}
     */
    static fromModel(model, world) {
        /** @type Class<ClientWorldEffect> */
        let clazz = this.Types.get(model.constructor)
        if(!clazz) return null
        return new clazz(model, world)
    }
}

export default ClientWorldEffect;