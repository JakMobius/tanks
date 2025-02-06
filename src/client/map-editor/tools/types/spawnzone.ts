import Tool from '../tool';
import Color from 'src/utils/color';
import SpawnZone from 'src/map/spawn-zone';
import GameMap from 'src/map/game-map';
import ToolManager from "../toolmanager";
import ConvexShapeProgram from "src/client/graphics/programs/convex-shapes/convex-shape-program";
import TilemapComponent from "src/physics/tilemap-component";
import EntityDrawer from "src/client/graphics/drawers/entity-drawer";
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import Entity from "src/utils/ecs/entity";

export class SpawnZoneDrawer extends EntityDrawer {
    tool: SpawnZoneTool

    constructor(tool: SpawnZoneTool) {
        super()

        this.tool = tool
    }

    draw(phase: DrawPhase) {
        const program = phase.getProgram(ConvexShapeProgram)

        const map = this.tool.manager.world.getComponent(TilemapComponent).map

        for(let zone of map.spawnZones) {
            program.drawRectangle(
                zone.minX * GameMap.BLOCK_SIZE,
                zone.minY * GameMap.BLOCK_SIZE,
                zone.maxX * GameMap.BLOCK_SIZE,
                zone.maxY * GameMap.BLOCK_SIZE,
                0x7F7F7F7F
            )
        }
    }
}

export default class SpawnZoneTool extends Tool {
    public image = "static/map-editor/spawnzones.png"
	public actionName = "Зона спавна";
	public selectedTeam: number | null = null;
	public clearZoneButton: JQuery;
    public visibleEntity = new Entity()

    public readonly colors = new Map<number, Color>([
        [0, new Color().setRGB(1, 0, 0)],
        [1, new Color().setRGB(0, 1, 0)],
        [2, new Color().setRGB(0, 0, 1)]
    ])

    constructor(manager: ToolManager) {
        super(manager);

        this.visibleEntity.addComponent(new SpawnZoneDrawer(this))

        this.setupMenu()
    }

    createTeamButton(i: number, color: Color): JQuery {
        return $("<div>").addClass("tool inline").append(
            $("<div>").addClass("wrapper")
                .css("background-color", color.code())
        ).on("click", (e) => this.selectTeam($(e.target).closest(".tool"), i))
    }

    selectTeam(button: JQuery, i: number) {
        button.parent().find(".tool.selected").removeClass("selected")
        button.addClass("selected")

        this.selectedTeam = i
        this.clearZoneButton.attr("disabled", "false")
    }

    setupMenu() {
        this.clearZoneButton = $("<button>").addClass("large")
            .text("Очистить")
            .attr("disabled", "true")
            .on("click", () => {
                if(this.selectedTeam !== null) {
                    this.deleteZone(this.selectedTeam)
                    this.manager.setNeedsRedraw()
                }
            })

        this.settingsView = $("<div>")

        for(let [index, color] of this.colors) {
            this.settingsView.append(this.createTeamButton(index, color))
        }

        this.settingsView
            .append(this.clearZoneButton)
            .css("width", "240px")
            .css("height", "100%")
    }

    becomeActive() {
        super.becomeActive();
        this.manager.world.appendChild(this.visibleEntity)
        this.manager.setNeedsRedraw()
    }

    resignActive() {
        super.resignActive();
        this.visibleEntity.removeFromParent()
        this.manager.setNeedsRedraw()
    }

    deleteZone(id: number) {
        const map = this.manager.world.getComponent(TilemapComponent).map

        let i = 0;
        for(let zone of map.spawnZones) {

            if(zone.id === id) {
                map.spawnZones.splice(i, 1)
                break
            }
            i++
        }
    }

    getZone(id: number) {
        const map = this.manager.world.getComponent(TilemapComponent).map

        for(let zone of map.spawnZones) {
            if(zone.id === id) {
                return zone
            }
        }

        return null
    }

    mouseDown(x: number, y: number) {
        super.mouseDown(x, y);
        const map = this.manager.world.getComponent(TilemapComponent).map

        if(this.selectedTeam === null) return
        let zone = this.getZone(this.selectedTeam)
        if(!zone) {
            zone = new SpawnZone(this.selectedTeam)
            map.spawnZones.push(zone)
        }

        zone.x1 = Math.floor(x / GameMap.BLOCK_SIZE)
        zone.y1 = Math.floor(y / GameMap.BLOCK_SIZE)
        zone.x2 = zone.x1
        zone.y2 = zone.y1
    }

    mouseMove(x: number, y: number) {
        super.mouseMove(x, y);

        if(this.selectedTeam !== null && this.dragging) {
            let zone = this.getZone(this.selectedTeam)

            zone.x2 = Math.floor(x / GameMap.BLOCK_SIZE)
            zone.y2 = Math.floor(y / GameMap.BLOCK_SIZE)

            this.manager.setNeedsRedraw()
        }
    }

}