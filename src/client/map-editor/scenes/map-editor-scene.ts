/* @load-resource: '../style.css' */

import Scene, {SceneConfig} from '../../scenes/scene';

import WorldDrawerComponent from '../../entity/components/world-drawer-component';
import Camera from '../../camera';
import MenuOverlay from '../ui/overlay/menu/menuoverlay';
import * as Box2D from '../../../library/box2d';
import GameMap from '../../../map/game-map';
import DragHandler from '../../controls/interact/drag-handler';
import ToolbarView from '../ui/overlay/workspace/toolbar/toolbar';
import ToolManager from '../tools/toolmanager';
import EventContainer from '../../ui/overlay/events/event-container';
import ToolSettingsView from '../ui/overlay/workspace/toolsettings/toolsettingsview';
import Tools from "../tools/type-loader"
import TilemapComponent from "src/physics/tilemap-component";
import GameMapHistoryComponent from "../history/game-map-history-component";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import ControlsManager from "src/client/controls/controls-manager";
import Entity from "src/utils/ecs/entity";
import {clientGameWorldEntityPrefab} from "src/client/client-game-world-entity-prefab";

export default class MapEditorScene extends Scene {

	public world: Entity
    public map: GameMap
	public dragHandler: DragHandler;
	public camera: Camera;
	public worldDrawer: WorldDrawerComponent;
	public menuOverlay: MenuOverlay;
	public toolManager: ToolManager;
	public eventContainer: EventContainer;
	public toolSettingsView: ToolSettingsView;
	public toolbar: ToolbarView;
    private worldAlive: boolean;
    private cameraMovementEnabled = true
    private cameraZoomEnabled = true
    private controlsEventHandler = new BasicEventHandlerSet()
    private needsRedraw = false

    constructor(config: SceneConfig) {
        super(config)

        this.world = new Entity()
        clientGameWorldEntityPrefab(this.world, {})

        this.dragHandler = new DragHandler(this.screen.canvas)
        this.dragHandler.draggingEnabled = false
        this.dragHandler.startListening()

        this.camera = new Camera({
            baseScale: 1,
            viewport: new Box2D.Vec2(0, 0),
            defaultPosition: new Box2D.Vec2(0, 0),
            limit: false,
            inertial: false
        })

        this.worldDrawer = new WorldDrawerComponent(this.camera, this.screen)
        this.world.addComponent(this.worldDrawer)

        this.setupWorkspace()

        this.menuOverlay = new MenuOverlay({
            root: this.overlayContainer
        })

        this.menuOverlay.on("open", (map) => {
            this.map = map
            this.world.getComponent(TilemapComponent).setMap(this.map)
            this.toolManager.world.getComponent(TilemapComponent).setMap(this.map)

            if(map) {
                if(!this.camera.target) {
                    this.camera.target = new Box2D.Vec2(0, 0)
                }
                this.camera.target.x = this.map.width * GameMap.BLOCK_SIZE / 2
                this.camera.target.y = this.map.height * GameMap.BLOCK_SIZE / 2
                this.camera.reset()
                this.menuOverlay.hide()
            } else {
                this.camera.target = null
            }

            this.setNeedsRedraw()
        })

        this.dragHandler.on("drag", (dx, dy) => {
            if(this.map && this.cameraMovementEnabled) {
                this.camera.target.x += dx / this.camera.baseScale
                this.camera.target.y += dy / this.camera.baseScale
                this.setNeedsRedraw()
            }
        })

        this.dragHandler.on("zoom", (zoom) => {
            if(this.map && this.cameraZoomEnabled) {
                this.camera.baseScale *= zoom;
                this.setNeedsRedraw()
            }
        })

        this.controlsEventHandler.on("game-pause", (event) => {
            if (this.menuOverlay.shown) {
                this.menuOverlay.hide()
            } else {
                this.menuOverlay.redraw()
                this.menuOverlay.show()
            }
        })

        this.controlsEventHandler.on("editor-undo", (event) => {
            const history = this.map.getComponent(GameMapHistoryComponent)
            let entry = history.goBack()

            if(entry) this.eventContainer.createEvent("Отменено: " + entry.actionName)
            else this.eventContainer.createEvent("Нечего отменять")
        })

        this.controlsEventHandler.on("editor-redo", (event) => {
            const history = this.map.getComponent(GameMapHistoryComponent)
            let entry = history.goForward()

            if(entry) this.eventContainer.createEvent("Повторено: " + entry.actionName)
            else this.eventContainer.createEvent("Нечего повторять")
        })

        this.controlsEventHandler.on("editor-save-maps", (event) => {
            if(this.menuOverlay.saveMaps()) {
                this.eventContainer.createEvent("Карты сохранены")
            } else {
                this.eventContainer.createEvent("Карты не сохранились. Что-то сломалось. Грр. Скачай карту ручками и покажи Артему чем насрало в консоль.")
            }
        })

        this.menuOverlay.show()
        this.layout()

        this.controlsEventHandler.setTarget(ControlsManager.getInstance())
    }

    setNeedsRedraw() {
        this.needsRedraw = true
    }

    setupWorkspace() {
        this.eventContainer = new EventContainer()
        this.toolSettingsView = new ToolSettingsView()
        this.toolManager = new ToolManager(this.screen, this.camera, this.world)
        this.toolManager.on("camera-movement", (enabled) => this.setCameraMovementEnabled(enabled))
        this.toolManager.on("world-alive", (alive) => this.setWorldAlive(alive))
        this.toolManager.on("user-event", (text) => this.eventContainer.createEvent(text))
        this.toolManager.on("redraw", () => this.setNeedsRedraw())
        this.worldDrawer.on("redraw", () => this.setNeedsRedraw())
        this.toolbar = new ToolbarView({
            root: this.overlayContainer
        })

        this.toolbar.on("tool-select", (tool) => {
            this.dragHandler.draggingEnabled = !tool.locksDragging
            this.toolSettingsView.setupTool(tool)
            this.toolManager.selectTool(tool)
        })

        this.toolbar.on("block-select", (block) => {
            this.toolManager.selectBlock(block)
        })

        this.toolbar.loadSavedBlock()

        Tools.map(Tool => new Tool(this.toolManager))
            .forEach((tool) => this.toolbar.addTool(tool))

        this.overlayContainer.append(this.toolSettingsView.element)
        this.overlayContainer.append(this.toolbar.element)
        this.overlayContainer.append(this.eventContainer.element)
    }

    layout() {
        super.layout();
        this.camera.viewport.x = this.screen.width
        this.camera.viewport.y = this.screen.height
    }

    draw(dt: number) {
        ControlsManager.getInstance().refresh()

        if(!this.map || !this.needsRedraw) return

        if(this.worldAlive) {
            this.world.propagateEvent("tick", dt)
        }
        this.camera.tick(dt)
        this.worldDrawer.draw(dt)
        if(this.toolManager.selectedTool) {
            this.toolManager.selectedTool.drawDecorations()
        }
        if(this.worldAlive) this.setNeedsRedraw()
    }

    setWorldAlive(alive: boolean) {
        this.worldAlive = alive
        this.setNeedsRedraw()
    }

    setCameraMovementEnabled(enabled: boolean) {
        this.cameraMovementEnabled = enabled
    }
}