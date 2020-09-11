const BulletModel = require("../bulletmodel.js");

class BulletModel42mm extends BulletModel {

	static typeName() { return 0 }

	constructor() {
		super();
	}
}

BulletModel.register(BulletModel42mm)

module.exports = BulletModel42mm