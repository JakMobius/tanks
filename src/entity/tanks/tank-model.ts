import TankControls from '../../controls/tank-controls';
import EntityModel from "../entity-model";
import EffectHost from "../../effects/effect-host";
import EffectReceiver from "../components/network/effect/effect-receiver";

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

        this.addComponent(new TankControls())
    }
}
