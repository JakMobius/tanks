import TankDrawer from "src/client/graphics/drawers/tank-drawer";
import Sprite from "src/client/graphics/sprite";
import {
    copyQuadrangle,
    squareQuadrangle,
    transformQuadrangle,
    translateQuadrangle,
    turnQuadrangle
} from "src/utils/quadrangle";
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import TankWheelsComponent from "src/entity/components/tank-wheels-component";
import TransformComponent from "src/entity/components/transform-component";
import TextureProgram from "src/client/graphics/programs/texture-program";
import LightMaskTextureProgram from "src/client/graphics/programs/light-mask-texture/light-mask-texture-program";
import WorldDrawerComponent from "src/client/entity/components/world-drawer-component";

export class Drawer extends TankDrawer {
    public bodyBrightSprite: Sprite;
    public bodyDarkSprite: Sprite;
    public bodyLightMask: Sprite;
    public wheelSprites: Sprite[];

    static bodyQuadrangle = squareQuadrangle(-2, -2.5, 4, 5)
    static wheelQuadrangle = squareQuadrangle(-0.45, -0.75, 0.9, 1.5)

    static spritesPerMeter = 20
    static wheelSpriteCount = 10

    constructor() {
        super();

        this.bodyBrightSprite = Sprite.named("tanks/monster/body-bright")
        this.bodyDarkSprite = Sprite.named("tanks/monster/body-dark")
        this.bodyLightMask = Sprite.named("tanks/monster/mask")

        this.wheelSprites = []

        for (let i = 1; i <= Drawer.wheelSpriteCount; i++) {
            this.wheelSprites.push(Sprite.named("tanks/monster/wheel_" + i))
        }
    }

    draw(phase: DrawPhase) {
        const model = this.entity
        const behaviour = model.getComponent(TankWheelsComponent)
        const transform = model.getComponent(TransformComponent)

        const wheelProgram = phase.getProgram(TextureProgram)
        const bodyProgram = phase.getProgram(LightMaskTextureProgram)

        for (let wheelGroup of behaviour.getWheelGroups()) {
            for(let wheel of wheelGroup.wheels) {
                let spriteIndex = Math.floor(-wheelGroup.getDistance() * Drawer.spritesPerMeter % Drawer.wheelSpriteCount);
                if (spriteIndex < 0) spriteIndex = Drawer.wheelSpriteCount + spriteIndex;
                const angle = wheel.angle

                const wheelQuadrangle = copyQuadrangle(Drawer.wheelQuadrangle)
                if (angle) turnQuadrangle(wheelQuadrangle, Math.sin(angle), Math.cos(angle))
                translateQuadrangle(wheelQuadrangle, wheel.x, wheel.y)
                transformQuadrangle(wheelQuadrangle, transform.transform)

                wheelProgram.drawSprite(this.wheelSprites[spriteIndex], wheelQuadrangle)
            }
        }

        const quadrangle = copyQuadrangle(Drawer.bodyQuadrangle)
        transformQuadrangle(quadrangle, transform.transform)
        bodyProgram.drawMaskedSprite(
            this.bodyBrightSprite,
            this.bodyDarkSprite,
            this.bodyLightMask,
            quadrangle,
            transform.getAngle(),
            WorldDrawerComponent.depths.tankBody
        )
    }
}