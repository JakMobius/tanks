import BulletModel from '../bulletmodel';
import {BinarySerializer} from "../../../serialization/binary/serializable";

class BulletModel42mm extends BulletModel {
	static typeName = 0
}

BinarySerializer.register(BulletModel42mm)

export default BulletModel42mm;