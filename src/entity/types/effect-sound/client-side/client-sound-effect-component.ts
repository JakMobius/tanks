import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import {WorldComponent} from "src/entity/game-world-entity-prefab";
import {SoundAssets} from "src/client/sound/sounds";
import SoundPositionComponent from "src/client/sound/sound/sound-position-component";
import SoundBufferComponent from "src/client/sound/sound/sound-buffer-component";

export default class ClientSoundEffectComponent extends EventHandlerComponent {
    constructor() {
        super();

        this.eventHandler.on("play-sound", (x: number, y: number, index: number) => {

            let sound = SoundBufferComponent.createSoundFromBuffer(SoundAssets[index])
            sound.addComponent(new SoundPositionComponent({x: x, y: y}))
            sound.getComponent(SoundBufferComponent).play();
            WorldComponent.getWorld(this.entity).appendChild(sound)
            sound.on("ended", () => sound.removeFromParent())
        })
    }
}