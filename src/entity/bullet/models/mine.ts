import BulletModel from '../bulletmodel';

class BulletModelMine extends BulletModel {

    static typeName() { return 7 }

    constructor(config) {
        super(config)
    }
}

// module.exports = new MineType({
//     name: "mine",
//     explodePower: 15,
//     mass: 0.5,
//     velocity: 0,
//     explodes: true,
//     id: 7
// })

BulletModel.register(BulletModelMine)

export default BulletModelMine;