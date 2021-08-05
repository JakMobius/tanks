import BlockState from '../blockstate';

export default class WoodBlockState extends BlockState {
	public variant: any;
    static health = 1500
    static typeName = "wood";
    static typeId = 3;

    constructor() {
        super();

        this.variant = Math.floor(Math.random() * 18)
    }
}