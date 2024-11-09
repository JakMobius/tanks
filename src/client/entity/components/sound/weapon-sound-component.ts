import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import SoundPrimaryComponent from "src/client/sound/sound/sound-primary-component";
import {WeaponComponent, WeaponRole} from "src/entity/components/weapon/weapon-component";
import {SoundAsset, SoundAssets} from "src/client/sound/sounds";
import {SoundType} from "src/sound/sounds";
import SoundBufferComponent from "src/client/sound/sound/sound-buffer-component";

export default class WeaponSoundComponent extends EventHandlerComponent {
    constructor() {
        super();

        this.eventHandler.on("weapon-reload-start", () => {
            let weaponComponent = this.entity.getComponent(WeaponComponent)
            if (weaponComponent.info?.role === WeaponRole.primary) {
                this.playSound(SoundAssets[SoundType.RELOAD_START])
            }
        })

        this.eventHandler.on("weapon-reload-end", () => {
            let weaponComponent = this.entity.getComponent(WeaponComponent)
            if (weaponComponent.info?.role === WeaponRole.primary) {
                this.playSound(SoundAssets[SoundType.RELOAD_END])
            }
        })
    }

    playSound(sound: SoundAsset | null) {
        if (!sound) {
            return
        }

        let soundEntity = SoundBufferComponent.createSoundFromBuffer(sound)
        soundEntity.getComponent(SoundBufferComponent).play()
        this.entity.appendChild(soundEntity)

        soundEntity.on("ended", () => soundEntity.removeFromParent())
    }
}