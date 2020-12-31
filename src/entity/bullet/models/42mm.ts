import BulletModel from '../bulletmodel';

class BulletModel42mm extends BulletModel {

	static typeName() { return 0 }

	constructor() {
		super();
	}
}

BulletModel.register(BulletModel42mm)

export default BulletModel42mm;