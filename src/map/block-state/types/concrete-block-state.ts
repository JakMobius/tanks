import BlockState from '../block-state';

export default class ConcreteBlockState extends BlockState {
    static health = 6000
    static typeName = "concrete";
    static typeId = 2;
}
