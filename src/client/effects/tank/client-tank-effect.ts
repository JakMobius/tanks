
import ClientEffect from '../client-effect';
import EffectModel from 'src/effects/effect-model';
import ClientTank from "../../entity/tank/client-tank";

export default class ClientTankEffect extends ClientEffect {
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