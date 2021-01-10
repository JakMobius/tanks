
import ClientEffect from '../clienteffect';
import EffectModel from 'src/effects/effect-model';
import ClientTank from "../../tanks/clienttank";

class ClientTankEffect extends ClientEffect {
	public model: EffectModel;
	public tank: ClientTank;

	static Model: typeof EffectModel

    constructor(model: EffectModel, tank: ClientTank) {
        super(model)
        this.model = model
        this.tank = tank
    }

    static fromModelAndTank(model: EffectModel, tank: ClientTank): ClientTankEffect | null {
        let clazz = this.Types.get(model.constructor as typeof EffectModel) as unknown as typeof ClientTankEffect
        if(!clazz) return null
        return new clazz(model, tank)
    }
}

export default ClientTankEffect;