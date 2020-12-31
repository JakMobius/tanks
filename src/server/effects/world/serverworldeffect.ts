
import ServerEffect from '../servereffect';
import WorldEffectModel from '@/effects/world/worldeffectmodel';

/**
 * This class unites all the world effect implementations on the server
 * side. If the effect is visual and should not have a separate logic
 * on the server side (does not scatter players, does not break
 * blocks, etc.), it is enough to set only its {@link WorldEffectModel} and
 * not to use this class. You also should not initialize this class
 * directly, use {@link ServerWorldEffect#fromModel fromModel} static method
 * instead
 */
class ServerWorldEffect extends ServerEffect {

    /**
     * @type WorldEffectModel
     */
    model

    /**
     * @type ServerGameWorld
     */
    world

    /**
     * @private
     * Creates server-side world effect class, linked to specific
     * {@link WorldEffectModel} and {@link ServerGameWorld}. This
     * constructor should not be called directly, use
     * {@link ServerWorldEffect#fromModel fromModel} static method
     * instead
     * @param {WorldEffectModel} model
     * @param {ServerGameWorld} world
     */
    constructor(model, world) {
        super(model);
        this.model = model
        this.world = world
    }


    // noinspection JSCheckFunctionSignatures
    /**
     * Wraps the {@link WorldEffectModel} in corresponding
     * {@link ServerWorldEffect} class. If this effect has any additional
     * server-side logic, the instance of appropriate subclass will be
     * returned. Otherwise, this method returns {@link ServerWorldEffect}
     * instance
     * @param model {WorldEffectModel} Effect model to wrap
     * @param world {ServerWorldEffect} A world which this effect will be created in
     * @returns {ServerWorldEffect}
     */
    static fromModel(model, world) {
        let clazz = /** @type Class<ServerWorldEffect> */ this.Types.get(model.constructor)

        if(clazz) return new clazz(model, world)

        // If this model has no server-side implementation, return
        // default class

        if(model instanceof WorldEffectModel) {
            return new ServerWorldEffect(model, world)
        }

        throw new TypeError("The 'model' argument should inherit WorldEffectModel")
    }
}

export default ServerWorldEffect;
