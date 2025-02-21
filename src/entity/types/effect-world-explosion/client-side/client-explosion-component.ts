import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import SoundPositionComponent from "src/client/sound/sound/sound-position-component";
import {chooseRandom} from "src/utils/utils";
import {WorldComponent} from "src/entity/game-world-entity-prefab";
import {SoundType} from "src/sound/sounds";
import Entity from "src/utils/ecs/entity";
import SoundPrimaryComponent, { BufferSoundSource } from "src/client/sound/sound/sound-primary-component";

const sounds: SoundType[] = [
    SoundType.EXPLODE_1,
    SoundType.EXPLODE_2,
    SoundType.EXPLODE_3,
    SoundType.EXPLODE_4
]

export default class ClientExplosionComponent extends EventHandlerComponent {
    constructor() {
        super();

        this.eventHandler.on("explode", (x: number, y: number, power: number) => {
            let soundType = chooseRandom(sounds)
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