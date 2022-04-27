
import EffectModel from "../effect-model";
import TankFireEffectModel from "./tank-fire-effect-model";

export default class TankPelletsEffectModel extends EffectModel {
    static typeName = 2
}

EffectModel.register(TankPelletsEffectModel)