import TankDrawer from "src/client/graphics/drawers/tank-drawer";
import {
    squareQuadrangle,
    translateQuadrangle,
    turnQuadrangle
} from "src/utils/quadrangle";
import Sprite from "src/client/graphics/sprite";
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import AirbagTankController from "src/entity/components/tank-controllers/airbag-tank-controller";
import TransformComponent from "src/entity/components/transform/transform-component";
import TextureProgram from "src/client/graphics/programs/texture-program";
import LightMaskTextureProgram from "src/client/graphics/programs/light-mask-texture/light-mask-texture-program";

import bodyBrightSprite from "textures/tanks/nasty/body-bright.texture.png"
import bodyDarkSprite from "textures/tanks/nasty/body-dark.texture.png"
import bodyLightMask from "textures/tanks/nasty/mask.texture.png"
import ruderSprite from "textures/tanks/nasty/ruder.texture.png"
import propellerSprites from "textures/tanks/nasty/propeller%.texture.png"
import { depths } from "src/client/graphics/depths";

export class Drawer extends TankDrawer {
    static bodyQuadrangle = squareQuadrangle(-2.97, -2.16, 5.94, 4.32)
    static ruderOffset = -0.4225
    static distanceCoefficient = 0.4
    static propellerSpriteCount = 4

    public bodyBrightSprite: Sprite;
    public bodyDarkSprite: Sprite;
    public bodyLightMask: Sprite;
    public ruderSprite: Sprite;
    public propellerSprites: Sprite[];

    constructor() {
        super();

        this.bodyBrightSprite = Sprite.named(bodyBrightSprite)
        this.bodyDarkSprite = Sprite.named(bodyDarkSprite)
        this.bodyLightMask = Sprite.named(bodyLightMask)
        this.ruderSprite = Sprite.named(ruderSprite)
        this.propellerSprites = propellerSprites.map(sprite => Sprite.named(sprite))
    }

    draw(phase: DrawPhase) {
        const model = this.entity
        const behaviour = model.getComponent(AirbagTankController)
        const transform = model.getComponent(TransformComponent)

        const propellerProgram = phase.getProgram(TextureProgram)
        const bodyProgram = phase.getProgram(LightMaskTextureProgram)

        propellerProgram.transform.save()
        bodyProgram.transform.save()

        propellerProgram.transform.set(transform.getGlobalTransform())
        bodyProgram.transform.set(transform.getGlobalTransform())

        bodyProgram.drawMaskedSprite(
            this.bodyBrightSprite,
            this.bodyDarkSprite,
            this.bodyLightMask,
            Drawer.bodyQuadrangle,
            transform.getGlobalAngle(),
            depths.tankBody
        )

        for(let propeller of behaviour.propellers) {
            const propellerDist = propeller.getDistance() * Drawer.distanceCoefficient
            const propellerSprite = this.propellerSprites[Math.round(propellerDist) % Drawer.propellerSpriteCount]

            const propellerQuadrangle = squareQuadrangle(-0.09, -0.6675, 0.18, 1.335)
            const ruderQuadrangle = squareQuadrangle(-0.99, -0.135, 1.125, 0.27)

            const ruderDirection = propeller.getRuderDirection()
            const propellerDirection = propeller.getDirection()

            turnQuadrangle(propellerQuadrangle, propellerDirection.y, propellerDirection.x)
            turnQuadrangle(ruderQuadrangle, ruderDirection.y, ruderDirection.x)

            translateQuadrangle(propellerQuadrangle, propeller.position.x, propeller.position.y)
            translateQuadrangle(ruderQuadrangle,
                propeller.position.x + propellerDirection.x * Drawer.ruderOffset,
                propeller.position.y + propellerDirection.y * Drawer.ruderOffset)

            propellerProgram.drawSprite(this.ruderSprite, ruderQuadrangle, depths.tankTop)
            propellerProgram.drawSprite(propellerSprite, propellerQuadrangle, depths.tankTop)
        }

        propellerProgram.transform.restore()
        bodyProgram.transform.restore()
    }
}