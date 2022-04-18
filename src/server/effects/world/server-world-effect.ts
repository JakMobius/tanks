import ServerEffect from '../server-effect';
import WorldEffectModel from 'src/effects/world/world-effect-model';
import ServerGameWorld from "../../server-game-world";

/**
 * This class unites all the world effect implementations on the server
 * side. If the effect is visual and should not have a separate logic
 * on the server side (does not scatter players, does not break
 * blocks, etc.), it is enough to set only its {@link WorldEffectModel} and
 * not to use this class. You also should not initialize this class
 * directly, use {@link ServerWorldEffect#fromModel fromModel} static method
 * instead
 */
export default class ServerWorldEffect extends ServerEffect {
    model: WorldEffectModel
    world: ServerGameWorld

    /**
     * @private
     * Creates server-side world effect class, linked to specific
     * {@link WorldEffectModel} and {@link ServerGameWorld}. This
     * constructor should not be called directly, use
     * {@link ServerWorldEffect#fromModel fromModel} static method
     * instead
     */
    constructor(model: WorldEffectModel, world: ServerGameWorld) {
        super(model);
        this.model = model
        this.world = world
    }

    /**
     * Wraps the {@link WorldEffectModel} in corresponding
     * {@link ServerWorldEffect} class. If this effect has any additional
     * server-side logic, the instance of appropriate subclass will be
     * returned. Otherwise, this method returns {@link ServerWorldEffect}
     * instance
     * @param model Effect model to wrap
     * @param world A world where this effect will be created in
     */
    static fromModelAndWorld(model: WorldEffectModel, world: ServerGameWorld): ServerWorldEffect {
        let clazz: typeof ServerWorldEffect = this.Types.get(model.constructor as typeof WorldEffectModel) as any as typeof ServerWorldEffect

        if(clazz) return new clazz(model, world)

        // If this model has no server-side implementation, return
        // default class

        if(model instanceof WorldEffectModel) {
            return new ServerWorldEffect(model, world)
        }

        throw new TypeError("The 'model' argument should inherit WorldEffectModel")
    }
}