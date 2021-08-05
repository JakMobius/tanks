import EffectModel from "./effect-model";

export default class AbstractEffect {
	public dead: boolean;
    public model: EffectModel

    constructor(model: EffectModel) {
        this.model = model
        this.dead = false
    }

    tick(dt: number): void {}

    die(): void {
        this.dead = true
    }
}