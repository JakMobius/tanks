import BasicEntityDrawer from "src/client/graphics/drawers/basic-entity-drawer";
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import ColoredTextureProgram from "src/client/graphics/programs/colored-texture-program";
import FlagStateReceiver from "src/entity/types/flag/client-side/flag-state-receiver";
import TeamColor from "src/utils/team-color";
import WorldDrawerComponent from "src/client/entity/components/world-drawer-component";

import flagSprite from "textures/misc/flag.texture.png"
import TransformComponent from "src/entity/components/transform/transform-component";
import { squareQuadrangle, transformQuadrangle, translateQuadrangle } from "src/utils/quadrangle";

export class Drawer extends BasicEntityDrawer {
    static spriteNames = [flagSprite]

    draw(phase: DrawPhase) {
        const program = phase.getProgram(ColoredTextureProgram)

        let teamId = this.entity.getComponent(FlagStateReceiver).teamId
        let colorCode: number = 0xFFFFFFFF
        if (teamId >= 0) {
            colorCode = TeamColor.getColor(teamId).getUint32()
        }

        program.setColor(colorCode)

        const transform = this.entity.getComponent(TransformComponent)
        let position = transform.getGlobalPosition()
        
        // Scale and angle are ignored here, since the flag acts
        // like a billboard (should always look upwards)

        const quadrangle = squareQuadrangle(-2 - 1.35, -2 - 1.85, 4, 4)
        translateQuadrangle(quadrangle, position.x, position.y)
        program.drawSprite(Drawer.getSprite(0), quadrangle, WorldDrawerComponent.depths.overlay)
    }
}