
class AbstractEffect {
	public dead: any;
	public Types: any;
    /**
     * @type EffectModel
     */
    model

    /**
     * @param {EffectModel} model
     */
    constructor(model) {
        this.model = model
        this.dead = false
    }

    tick(dt) {}

    /**
     * @type {Map<Class<EffectModel>, Class<AbstractEffect>>}
     */
    static Types = new Map()

    /**
     * @param modelClass {Class<EffectModel>}
     * @param effectClass {Class<AbstractEffect>}
     */
    static associate(modelClass, effectClass) {
        this.Types.set(modelClass, effectClass)
    }

    /**
     * @param model {EffectModel}
     * @returns {AbstractEffect | null}
     */
    static fromModel(model) {
        let clazz = this.Types.get(model.constructor)
        if(!clazz) return null
        return new clazz(model)
    }

    die() {
        this.dead = true
    }
}

export default AbstractEffect;