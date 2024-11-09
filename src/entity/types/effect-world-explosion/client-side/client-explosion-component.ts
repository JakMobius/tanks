import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import SoundPositionComponent from "src/client/sound/sound/sound-position-component";
import {chooseRandom} from "src/utils/utils";
import {WorldComponent} from "src/entity/game-world-entity-prefab";
import {SoundType} from "src/sound/sounds";
import {SoundAssets} from "src/client/sound/sounds";
import SoundBufferComponent from "src/client/sound/sound/sound-buffer-component";

const sounds = [
    SoundType.EXPLODE_1,
    SoundType.EXPLODE_2,
    SoundType.EXPLODE_3,
    SoundType.EXPLODE_4
]

export default class ClientExplosionComponent extends EventHandlerComponent {
    constructor() {
        super();

        this.eventHandler.on("explode", (x: number, y: number, power: number) => {
            let soundAsset = chooseRandom(sounds)
            let sound = SoundBufferComponent.createSoundFromBuffer(SoundAssets[soundAsset])
            sound.addComponent(new SoundPositionComponent({x: x, y: y}))
            sound.getComponent(SoundBufferComponent).play();
            // Since explode entity is a short-living one, attach the sound entity to the world
            WorldComponent.getWorld(this.entity).appendChild(sound)
            sound.on("ended", () => sound.removeFromParent())
        })
    }
}