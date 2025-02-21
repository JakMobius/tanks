import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import {WorldComponent} from "src/entity/game-world-entity-prefab";
import SoundPositionComponent from "src/client/sound/sound/sound-position-component";
import SoundPrimaryComponent, { BufferSoundSource } from "src/client/sound/sound/sound-primary-component";
import Entity from "src/utils/ecs/entity";
import { SoundType } from "src/sound/sounds";

export default class ClientSoundEffectComponent extends EventHandlerComponent {
    constructor() {
        super();

        this.eventHandler.on("play-sound", (x: number, y: number, soundType: SoundType) => {
            let soundEntity = new Entity()
            soundEntity.addComponent(new SoundPrimaryComponent((listener) => {
                return new BufferSoundSource(listener.engine, soundType)
            }))
            soundEntity.addComponent(new SoundPositionComponent({x: x, y: y}))
            WorldComponent.getWorld(this.entity).appendChild(soundEntity)

            soundEntity.on("ended", () => soundEntity.removeFromParent())
            soundEntity.getComponent(SoundPrimaryComponent).startAll()
        })
    }
}