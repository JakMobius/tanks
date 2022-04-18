import TankControls from '../../controls/tank-controls';
import EntityModel from "../entity-model";
import EffectHost from "../../effects/effect-host";

/**
 * Tank model. Combines the physical model
 * of the tank, its behavior and controls.
 * This class used both on client and server
 * side. Can be updated dynamically through
 * binary serialization.
 */

export default class TankModel extends EntityModel {
    static Types = new Map();

    constructor() {
        super()

        // TODO: should we add effectHost to each entity?...
        this.addComponent(new EffectHost())
        this.addComponent(new TankControls())
    }
}
