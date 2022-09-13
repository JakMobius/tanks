import WorldExplodeEffectModel from 'src/effects/models/world-explode-effect-model';
import ExplodeEffectPool from "src/effects/explode/explode-effect-pool";
import ClientEffect from "../client-effect";
import SoundPrimaryComponent from "src/client/sound/sound/sound-primary-component";
import SoundPositionComponent from "src/client/sound/sound/sound-position-component";
import Sounds from "src/client/sound/sounds";

const sounds = [
    Sounds.EXPLODE_1,
    Sounds.EXPLODE_2,
    Sounds.EXPLODE_3,
    Sounds.EXPLODE_4
]

export default class ClientWorldExplodeEffect extends ClientEffect {
	public model: WorldExplodeEffectModel

	static Model = WorldExplodeEffectModel

    constructor(model: WorldExplodeEffectModel) {
        super(model);
        this.model = model
    }

    private randomSound() {
        return sounds[Math.floor(Math.random() * sounds.length)]
    }

    tick(dt: number) {
        let entity = this.host.entity
        entity.getComponent(ExplodeEffectPool).start(this.model.x, this.model.y, this.model.power)

        let sound = SoundPrimaryComponent.createSound(this.randomSound())
        sound.addComponent(new SoundPositionComponent({ x: this.model.x, y: this.model.y}))
        sound.getComponent(SoundPrimaryComponent).play();

        this.die()
    }
}