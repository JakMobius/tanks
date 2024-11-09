import TankDrawer from "src/client/graphics/drawers/tank-drawer";
import {
    copyQuadrangle,
    squareQuadrangle,
    transformQuadrangle,
    translateQuadrangle,
    turnQuadrangle
} from "src/utils/quadrangle";
import Sprite from "src/client/graphics/sprite";
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import AirbagTankController from "src/entity/components/tank-controllers/airbag-tank-controller";
import TransformComponent from "src/entity/components/transform-component";
import TextureProgram from "src/client/graphics/programs/texture-program";
import LightMaskTextureProgram from "src/client/graphics/programs/light-mask-texture/light-mask-texture-program";
import WorldDrawerComponent from "src/client/entity/components/world-drawer-component";

export class Drawer extends TankDrawer {
    static bodyQuadrangle = squareQuadrangle(-2.16, -2.97, 4.32, 5.94)
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

        this.bodyBrightSprite = Sprite.named("tanks/nasty/body-bright")
        this.bodyDarkSprite = Sprite.named("tanks/nasty/body-dark")
        this.bodyLightMask = Sprite.named("tanks/nasty/mask")

        this.ruderSprite = Sprite.named("tanks/nasty/ruder")
        this.propellerSprites = []

        for (let i = 1; i <= Drawer.propellerSpriteCount; i++)
            this.propellerSprites.push(Sprite.named("tanks/nasty/propeller_" + i))
    }

    draw(phase: DrawPhase) {
        const model = this.entity
        const behaviour = model.getComponent(AirbagTankController)
        const transform = model.getComponent(TransformComponent)

        const propellerProgram = phase.getProgram(TextureProgram)
        const bodyProgram = phase.getProgram(LightMaskTextureProgram)

        const bodyQuadrangle = copyQuadrangle(Drawer.bodyQuadrangle)

        transformQuadrangle(bodyQuadrangle, transform.transform)

        bodyProgram.drawMaskedSprite(
            this.bodyBrightSprite,
            this.bodyDarkSprite,
            this.bodyLightMask,
            bodyQuadrangle,
            transform.getAngle(),
            WorldDrawerComponent.depths.tankBody
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

            transformQuadrangle(propellerQuadrangle, transform.transform)
            transformQuadrangle(ruderQuadrangle, transform.transform)

            propellerProgram.drawSprite(this.ruderSprite, ruderQuadrangle, WorldDrawerComponent.depths.tankTop)
            propellerProgram.drawSprite(propellerSprite, propellerQuadrangle, WorldDrawerComponent.depths.tankTop)
        }
    }
}