import "./spawnzones.scss"

import Tool from '../tool';
import Color from 'src/utils/color';
import ToolManager from "../toolmanager";
import ConvexShapeProgram from "src/client/graphics/programs/convex-shapes/convex-shape-program";
import EntityDrawer from "src/client/graphics/drawers/entity-drawer";
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import Entity from "src/utils/ecs/entity";
import { ToolViewProps } from '../../../ui/tool-settings/tool-settings-view';
import React, { useCallback } from 'react';
import WorldTilemapComponent from "src/physics/world-tilemap-component";
import SpawnzonesComponent, { SpawnZone } from "src/map/spawnzones-component";
import TilemapComponent from "src/map/tilemap-component";

interface SpawnZoneTeamViewProps {
    index: number
    onClick: (index: number) => void
    backgroundColor: string
    selected: boolean
}

const SpawnZoneTeamView: React.FC<SpawnZoneTeamViewProps> = (props) => {

    const onClick = useCallback(() => {
        props.onClick(props.index)
    }, [props.index])

    return (
        <div className={"tool " + (props.selected ? "selected" : "")} onClick={onClick}>
            <div className="teal-colorbox" style={{ backgroundColor: props.backgroundColor }} />
        </div>
    )
}

const SpawnZoneToolView: React.FC<ToolViewProps<SpawnZoneTool>> = (props) => {

    const onTeamSelect = useCallback((index: number) => {
        props.tool?.selectTeam(index)
    }, [props.tool])

    const clearZone = useCallback(() => {
        props.tool?.deleteZone(props.tool?.selectedTeam)
    }, [props.tool])

    return (
        <div className="tool-preferences">
            { Array.from(props.tool?.colors.entries()).map(([index, color]) => (
                <SpawnZoneTeamView
                    key={index}
                    index={index}
                    onClick={onTeamSelect}
                    backgroundColor={color.code()}
                    selected={props.tool?.selectedTeam === index}/>
            ))}
            <button className="large" disabled={props.tool?.selectedTeam === null} onClick={clearZone}>Очистить</button>
        </div>
    )
}

export class SpawnZoneDrawer extends EntityDrawer {
    tool: SpawnZoneTool

    constructor(tool: SpawnZoneTool) {
        super()

        this.tool = tool
    }

    draw(phase: DrawPhase) {
        const program = phase.getProgram(ConvexShapeProgram)

        const map = this.tool.manager.world.getComponent(WorldTilemapComponent).map
        const spawnzones = map.getComponent(SpawnzonesComponent)

        for(let zone of spawnzones.spawnZones) {
            program.drawRectangle(
                zone.minX * TilemapComponent.BLOCK_SIZE,
                zone.minY * TilemapComponent.BLOCK_SIZE,
                zone.maxX * TilemapComponent.BLOCK_SIZE,
                zone.maxY * TilemapComponent.BLOCK_SIZE,
                0x7F7F7F7F
            )
        }
    }
}

export default class SpawnZoneTool extends Tool {
    public image = "static/map-editor/spawnzones.png"
	public actionName = "Зона спавна";
	public selectedTeam: number | null = null;
    public visibleEntity = new Entity()

    public readonly colors = new Map<number, Color>([
        [0, new Color().setRGB(1, 0, 0)],
        [1, new Color().setRGB(0, 1, 0)],
        [2, new Color().setRGB(0, 0, 1)]
    ])

    constructor(manager: ToolManager) {
        super(manager);

        this.visibleEntity.addComponent(new SpawnZoneDrawer(this))
        this.settingsView = SpawnZoneToolView
    }

    selectTeam(i: number) {
        this.selectedTeam = i
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
        const map = this.manager.world.getComponent(WorldTilemapComponent).map
        const spawnzones = map.getComponent(SpawnzonesComponent)

        let i = 0;
        for(let zone of spawnzones.spawnZones) {

            if(zone.id === id) {
                spawnzones.spawnZones.splice(i, 1)
                break
            }
            i++
        }

        this.manager.setNeedsRedraw()
    }

    getZone(id: number) {
        const map = this.manager.world.getComponent(WorldTilemapComponent).map
        const spawnzones = map.getComponent(SpawnzonesComponent)

        for(let zone of spawnzones.spawnZones) {
            if(zone.id === id) {
                return zone
            }
        }

        return null
    }

    mouseDown(x: number, y: number) {
        super.mouseDown(x, y);
        const map = this.manager.world.getComponent(WorldTilemapComponent).map
        const spawnzones = map.getComponent(SpawnzonesComponent)

        if(this.selectedTeam === null) return
        let zone = this.getZone(this.selectedTeam)
        if(!zone) {
            zone = new SpawnZone(this.selectedTeam)
            spawnzones.spawnZones.push(zone)
        }

        zone.x1 = Math.floor(x / TilemapComponent.BLOCK_SIZE)
        zone.y1 = Math.floor(y / TilemapComponent.BLOCK_SIZE)
        zone.x2 = zone.x1
        zone.y2 = zone.y1
    }

    mouseMove(x: number, y: number) {
        super.mouseMove(x, y);

        if(this.selectedTeam !== null && this.dragging) {
            let zone = this.getZone(this.selectedTeam)

            zone.x2 = Math.floor(x / TilemapComponent.BLOCK_SIZE)
            zone.y2 = Math.floor(y / TilemapComponent.BLOCK_SIZE)

            this.manager.setNeedsRedraw()
        }
    }

}