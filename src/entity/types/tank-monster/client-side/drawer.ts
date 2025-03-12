import TankDrawer from "src/client/graphics/drawers/tank-drawer";
import Sprite from "src/client/graphics/sprite";
import {
    copyQuadrangle,
    squareQuadrangle,
    translateQuadrangle,
    turnQuadrangle
} from "src/utils/quadrangle";
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import TankWheelsComponent from "src/entity/components/tank-wheels-component";
import TransformComponent from "src/entity/components/transform/transform-component";
import TextureProgram from "src/client/graphics/programs/texture-program";
import LightMaskTextureProgram from "src/client/graphics/programs/light-mask-texture/light-mask-texture-program";

import bodyBrightSprite from "textures/tanks/monster/body-bright.texture.png"
import bodyDarkSprite from "textures/tanks/monster/body-dark.texture.png"
import bodyLightMask from "textures/tanks/monster/mask.texture.png"
import wheelSprites from "textures/tanks/monster/wheel%.texture.png"
import { depths } from "src/client/graphics/depths";

export class Drawer extends TankDrawer {
    public bodyBrightSprite: Sprite;
    public bodyDarkSprite: Sprite;
    public bodyLightMask: Sprite;
    public wheelSprites: Sprite[];

    static bodyQuadrangle = squareQuadrangle(-2.5, -2, 5, 4)
    static wheelQuadrangle = squareQuadrangle(-0.75, -0.45, 1.5, 0.9)

    static spritesPerMeter = 20
    static wheelSpriteCount = 10

    constructor() {
        super();

        this.bodyBrightSprite = Sprite.named(bodyBrightSprite)
        this.bodyDarkSprite = Sprite.named(bodyDarkSprite)
        this.bodyLightMask = Sprite.named(bodyLightMask)

        this.wheelSprites = wheelSprites.map(sprite => Sprite.named(sprite))
    }

    draw(phase: DrawPhase) {
        const model = this.entity
        const behaviour = model.getComponent(TankWheelsComponent)
        const transform = model.getComponent(TransformComponent)

        const wheelProgram = phase.getProgram(TextureProgram)
        const bodyProgram = phase.getProgram(LightMaskTextureProgram)

        wheelProgram.transform.save()
        bodyProgram.transform.save()
    
        wheelProgram.transform.set(transform.getGlobalTransform())
        bodyProgram.transform.set(transform.getGlobalTransform())

        for (let wheelGroup of behaviour.getWheelGroups()) {
            for(let wheel of wheelGroup.wheels) {
                let spriteIndex = Math.floor(-wheelGroup.getDistance() * Drawer.spritesPerMeter % Drawer.wheelSpriteCount);
                if (spriteIndex < 0) spriteIndex = Drawer.wheelSpriteCount + spriteIndex;
                const angle = wheel.angle

                const wheelQuadrangle = copyQuadrangle(Drawer.wheelQuadrangle)
                if (angle) turnQuadrangle(wheelQuadrangle, Math.sin(angle), Math.cos(angle))
                translateQuadrangle(wheelQuadrangle, wheel.x, wheel.y)

                wheelProgram.drawSprite(this.wheelSprites[spriteIndex], wheelQuadrangle)
            }
        }

        bodyProgram.drawMaskedSprite(
            this.bodyBrightSprite,
            this.bodyDarkSprite,
            this.bodyLightMask,
            Drawer.bodyQuadrangle,
            transform.getGlobalAngle(),
            depths.tankBody
        )

        wheelProgram.transform.restore()
        bodyProgram.transform.restore()
    }
}