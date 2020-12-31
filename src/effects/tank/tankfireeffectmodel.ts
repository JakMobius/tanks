
import TankEffectModel from './tankeffectmodel';

class TankFireEffectModel extends TankEffectModel {
    static typeName() {
        return 1
    }
}

TankEffectModel.register(TankFireEffectModel)
export default TankFireEffectModel;