
const BulletModel = require("../bulletmodel")

class BulletModel16mm extends BulletModel {

    static typeName() { return 4 }

    constructor() {
        super();
    }
}

BulletModel.register(BulletModel16mm)

module.exports = BulletModel16mm