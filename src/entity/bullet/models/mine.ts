import BulletModel from '../bulletmodel';
import {BinarySerializer} from "../../../serialization/binary/serializable";

class BulletModelMine extends BulletModel {
    static typeName = 7
}

// module.exports = new MineType({
//     name: "mine",
//     explodePower: 15,
//     mass: 0.5,
//     velocity: 0,
//     explodes: true,
//     id: 7
// })

BinarySerializer.register(BulletModelMine)

export default BulletModelMine;