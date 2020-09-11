
const TankEffectModel = require("./tankeffectmodel")

class TankFireEffectModel extends TankEffectModel {
    static typeName() {
        return 1
    }
}

TankEffectModel.register(TankFireEffectModel)
module.exports = TankFireEffectModel