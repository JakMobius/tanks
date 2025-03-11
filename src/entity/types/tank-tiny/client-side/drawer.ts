import TankDrawer from "src/client/graphics/drawers/tank-drawer";
import Sprite from "src/client/graphics/sprite";
import { squareQuadrangle } from "src/utils/quadrangle";
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import TankWheelsComponent from "src/entity/components/tank-wheels-component";
import TransformComponent from "src/entity/components/transform/transform-component";
import TextureProgram from "src/client/graphics/programs/texture-program";
import WorldDrawerComponent from "src/client/entity/components/world-drawer-component";

import bodyBrightSprite from "textures/tanks/tiny/body.texture.png"
import wheelSprites from "textures/tanks/tiny/wheel%.texture.png"

export class Drawer extends TankDrawer {
    public bodySprite: Sprite;
    public wheelSprites: Sprite[];

    static bodyQuadrangle = squareQuadrangle(-1.65, -1.25, 3.3, 2.5)
    static wheelQuadrangle = squareQuadrangle(-0.675, -0.425, 1.35, 0.85)

    static spritesPerMeter = 10
    static wheelSpriteCount = 5

    constructor() {
        super();

        this.bodySprite = Sprite.named(bodyBrightSprite)
        this.wheelSprites = wheelSprites.map(sprite => Sprite.named(sprite))
    }

    draw(phase: DrawPhase) {
        const model = this.entity
        const behaviour = model.getComponent(TankWheelsComponent)
        const transform = model.getComponent(TransformComponent)

        const wheelProgram = phase.getProgram(TextureProgram)
        const bodyProgram = phase.getProgram(TextureProgram)

        wheelProgram.transform.save()
        bodyProgram.transform.save()

        wheelProgram.transform.set(transform.getGlobalTransform())
        bodyProgram.transform.set(transform.getGlobalTransform())

        for (let wheelGroup of behaviour.getWheelGroups()) {
            for(let wheel of wheelGroup.wheels) {
                let spriteIndex = Math.floor(-wheelGroup.getDistance() * Drawer.spritesPerMeter % Drawer.wheelSpriteCount);
                if (spriteIndex < 0) spriteIndex = Drawer.wheelSpriteCount + spriteIndex;
                const angle = wheel.angle

                wheelProgram.transform.save()
                wheelProgram.transform.translate(wheel.x, wheel.y)
                wheelProgram.transform.rotate(-angle)

                wheelProgram.drawSprite(this.wheelSprites[spriteIndex], Drawer.wheelQuadrangle)
                wheelProgram.transform.restore()
            }
        }

        bodyProgram.drawSprite(this.bodySprite, Drawer.bodyQuadrangle, WorldDrawerComponent.depths.tankBody)

        wheelProgram.transform.restore()
        bodyProgram.transform.restore
    }
}