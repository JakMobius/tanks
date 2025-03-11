import BlockState, { BlockStateConfig } from '../block-state'

export default class WoodBlockState extends BlockState {
	public variant: number;
    static health = 1500
    static typeName = "wood";
    static typeId = 3;

    constructor(options?: BlockStateConfig) {
        super(options);

        this.variant = Math.floor(Math.random() * 18)
    }
}