import BasicEntityDrawer from "src/client/graphics/drawers/basic-entity-drawer";
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import ColoredTextureProgram from "src/client/graphics/programs/colored-texture-program";
import FlagStateComponent from "src/entity/types/flag/flag-state-component";
import TeamColor from "src/utils/team-color";
import WorldDrawerComponent from "src/client/entity/components/world-drawer-component";

export class Drawer extends BasicEntityDrawer {
    static spriteNames = ["misc/flag"]

    draw(phase: DrawPhase) {
        const program = phase.getProgram(ColoredTextureProgram)

        let teamId = this.entity.getComponent(FlagStateComponent).teamId
        let colorCode: number = 0xFFFFFFFF
        if (teamId >= 0) {
            colorCode = TeamColor.getColor(teamId).getUint32()
        }

        program.setColor(colorCode)

        this.drawSpriteWithProgram(Drawer.getSprite(0), 4, 4, program, WorldDrawerComponent.depths.overlay)
    }
}