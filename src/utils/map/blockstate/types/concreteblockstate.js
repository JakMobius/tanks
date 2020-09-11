const BlockState = require("../blockstate")

class ConcreteBlockState extends BlockState {
    static health = 6000
    static typeName = "concrete";
    static typeId = 2;
}

BlockState.registerBlockStateClass(ConcreteBlockState)

module.exports = ConcreteBlockState