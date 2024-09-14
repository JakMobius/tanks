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
import WorldDrawerComponent from "src/client/entity/components/world-drawer-component";

export class Drawer extends TankDrawer {
    public bodySprite: Sprite;
    public wheelSprites: Sprite[];

    static bodyQuadrangle = squareQuadrangle(-1.25, -1.65, 2.5, 3.3)
    static wheelQuadrangle = squareQuadrangle(-0.425, -0.675, 0.85, 1.35)

    static spritesPerMeter = 10
    static wheelSpriteCount = 5

    constructor() {
        super();

        this.bodySprite = Sprite.named("tanks/tiny/body")

        this.wheelSprites = []

        for (let i = 1; i <= Drawer.wheelSpriteCount; i++) {
            this.wheelSprites.push(Sprite.named("tanks/tiny/wheel_" + i))
        }
    }

    draw(phase: DrawPhase) {
        const model = this.entity
        const behaviour = model.getComponent(TankWheelsComponent)
        const transform = model.getComponent(TransformComponent)

        const wheelProgram = phase.getProgram(TextureProgram)
        const bodyProgram = phase.getProgram(TextureProgram)

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
        bodyProgram.drawSprite(this.bodySprite, quadrangle, WorldDrawerComponent.depths.tankBody)
    }
}