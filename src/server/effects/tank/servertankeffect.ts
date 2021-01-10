
import ServerEffect from '../servereffect';
import TankEffectModel from 'src/effects/tank/tankeffectmodel';
import ServerTank from "../../tanks/servertank";
import EffectModel from "../../../effects/effect-model";

/**
 * This class unites all the tank effect implementations on the server
 * side. If the effect is visual and should not have a separate logic
 * on the server side (does not scatter players, does not break
 * blocks, etc.), it is enough to set only its {@link EffectModel} and
 * not to use this class. You also should not initialize this class
 * directly, use {@link ServerTankEffect#fromModel fromModel} static method
 * instead
 */
class ServerTankEffect extends ServerEffect {

    model: TankEffectModel
    tank: ServerTank

    /**
     * @private
     * Creates server-side tank effect class, linked to specific
     * {@link TankEffectModel} and {@link ServerTank}. This
     * constructor should not be called directly, use
     * {@link ServerTankEffect#fromModel fromModel} static method
     * instead
     */
    constructor(model: TankEffectModel, tank: ServerTank) {
        super(model);
        this.model = model
        this.tank = tank
    }

    // noinspection JSCheckFunctionSignatures
    /**
     * Wraps the {@link TankEffectModel} in corresponding
     * {@link ServerTankEffect} class. If this effect has any additional
     * server-side logic, the instance of appropriate subclass will be
     * returned. Otherwise, this method returns {@link ServerTankEffect}
     * instance
     * @param model Effect model to wrap
     * @param tank Tank, on which this effect will be applied on
     */
    static fromModelAndTank(model: TankEffectModel, tank: ServerTank): ServerTankEffect {
        let clazz = this.Types.get(model.constructor as typeof TankEffectModel) as typeof ServerTankEffect

        if(clazz) return new clazz(model, tank)

        // If this model has no server-side implementation, return
        // default class

        if(model instanceof TankEffectModel) {
            return new ServerTankEffect(model, tank)
        }

        throw new TypeError("The 'model' argument should inherit TankEffectModel")
    }
}

export default ServerTankEffect;
