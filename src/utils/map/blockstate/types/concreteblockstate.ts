import BlockState from '../blockstate';

class ConcreteBlockState extends BlockState {
    static health = 6000
    static typeName = "concrete";
    static typeId = 2;
}

export default ConcreteBlockState;