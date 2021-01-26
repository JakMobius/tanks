
import Tool from '../tool';
import ParticleProgram from '../../../graphics/programs/particleprogram';
import Particle from '../../../particles/particle';
import Color from '../../../../utils/color';
import SpawnZone from '../../../../utils/map/spawnzone';
import GameMap from '../../../../utils/map/gamemap';
import ToolManager from "../toolmanager";

class SpawnZoneTool extends Tool {
    public image = "assets/mapeditor/spawnzones.png"
	public actionName = "Зона спавна";
	public selectedTeam: number | null = null;
	public program: ParticleProgram;
	public clearZoneButton: JQuery;
	public decorations = new Map<number, Particle>();

    public readonly colors = new Map<number, Color>([
        [0, new Color(255, 0, 0)],
        [1, new Color(0, 255, 0)],
        [2, new Color(0, 0, 255)]
    ])

    constructor(manager: ToolManager) {
        super(manager);

        this.program = new ParticleProgram("spawn-zones-program", this.manager.screen.ctx)

        this.setupMenu()
        this.setupDecorations()
    }

    createTeamButton(i: number, color: Color): JQuery {
        return $("<div>").addClass("tool inline").append(
            $("<div>").addClass("wrapper")
                .css("background-color", color.code())
        ).click((e) => this.selectTeam($(e.target).closest(".tool"), i))
    }

    selectTeam(button: JQuery, i: number) {
        button.parent().find(".tool.selected").removeClass("selected")
        button.addClass("selected")

        this.selectedTeam = i
        this.clearZoneButton.attr("disabled", "false")
    }

    setupMenu() {
        this.clearZoneButton = $("<button>")
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

    setupDecorations() {

        for(let [index, color] of this.colors) {
            let decoration = new Particle({
                x: 0, y: 0,
                color: color.withAlpha(0.5)
            })

            this.decorations.set(index, decoration)
        }
    }

    drawDecorations() {
        super.drawDecorations();

        this.program.use()
        this.program.prepare()

        for(let zone of this.manager.map.spawnZones) {
            let decoration = this.decorations.get(zone.id)
            decoration.x = zone.centerX() * GameMap.BLOCK_SIZE
            decoration.y = zone.centerY() * GameMap.BLOCK_SIZE
            decoration.width = zone.width() * GameMap.BLOCK_SIZE
            decoration.height = zone.height() * GameMap.BLOCK_SIZE

            this.program.drawParticle(decoration)
        }

        this.program.matrixUniform.setMatrix(this.manager.camera.matrix.m)
        this.program.draw()
    }

    becomeActive() {
        super.becomeActive();

        this.manager.setNeedsRedraw()
    }

    resignActive() {
        super.resignActive();

        this.manager.setNeedsRedraw()
    }

    deleteZone(id: number) {
        let i = 0;
        for(let zone of this.manager.map.spawnZones) {

            if(zone.id === id) {
                this.manager.map.spawnZones.splice(i, 1)
                break
            }
            i++
        }
    }

    getZone(id: number) {
        for(let zone of this.manager.map.spawnZones) {
            if(zone.id === id) {
                return zone
            }
        }

        return null
    }

    mouseDown(x: number, y: number) {
        super.mouseDown(x, y);

        if(this.selectedTeam === null) return
        let zone = this.getZone(this.selectedTeam)
        if(!zone) {
            zone = new SpawnZone(this.selectedTeam)
            this.manager.map.spawnZones.push(zone)
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

export default SpawnZoneTool;