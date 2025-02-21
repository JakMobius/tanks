import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import SoundPrimaryComponent, { BufferSoundSource } from "src/client/sound/sound/sound-primary-component";
import {WeaponComponent, WeaponRole} from "src/entity/components/weapon/weapon-component";
import {SoundType} from "src/sound/sounds";
import Entity from "src/utils/ecs/entity";

export default class WeaponSoundComponent extends EventHandlerComponent {
    constructor() {
        super();

        this.eventHandler.on("weapon-reload-start", () => {
            let weaponComponent = this.entity.getComponent(WeaponComponent)
            if (weaponComponent.info?.role === WeaponRole.primary) {
                this.playSound(SoundType.RELOAD_START)
            }
        })

        this.eventHandler.on("weapon-reload-end", () => {
            let weaponComponent = this.entity.getComponent(WeaponComponent)
            if (weaponComponent.info?.role === WeaponRole.primary) {
                this.playSound(SoundType.RELOAD_END)
            }
        })
    }

    playSound(sound: SoundType) {
        let soundEntity = new Entity()
        let soundPrimaryComponent = new SoundPrimaryComponent((listener) => {
            return new BufferSoundSource(listener.engine, sound)
        })
        soundEntity.addComponent(soundPrimaryComponent)
        this.entity.appendChild(soundEntity)

        soundEntity.on("ended", () => soundEntity.removeFromParent())
        soundEntity.getComponent(SoundPrimaryComponent).startAll()
    }
}