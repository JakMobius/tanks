/* @load-resource: '../style.css' */

import Scene from '../../scenes/scene';

import WorldDrawerComponent from '../../entity/components/world-drawer-component';
import CameraComponent from 'src/client/graphics/camera';
import GameMap from '../../../map/game-map';
import MapEditorBackgroundOverlay from 'src/client/controls/interact/map-editor-background-overlay';
import ToolbarView from 'src/client/map-editor/ui/workspace-overlay/toolbar/toolbar';
import ToolManager from '../tools/toolmanager';
import EventOverlay from 'src/client/ui/overlay/events-overlay/event-overlay';
import ToolSettingsView from 'src/client/map-editor/ui/workspace-overlay/tool-settings/tool-settings-view';
import Tools from "../tools/type-loader"
import TilemapComponent from "src/physics/tilemap-component";
import GameMapHistoryComponent from "../history/game-map-history-component";
import RootControlsResponder, {ControlsResponder} from "src/client/controls/root-controls-responder";
import Entity from "src/utils/ecs/entity";
import {clientGameWorldEntityPrefab} from "src/client/entity/client-game-world-entity-prefab";
import WorldSoundListenerComponent from "src/client/entity/components/sound/world-sound-listener-component";
import PauseOverlay from "src/client/ui/overlay/pause-overlay/pause-overlay";
import MapEditorPauseMainController from "src/client/map-editor/ui/pause/map-editor-pause-main-controller";
import CameraPositionController from "src/entity/components/camera-position-controller";
import TransformComponent from "src/entity/components/transform-component";

export default class MapEditorScene extends Scene {

    public world: Entity
    public map: GameMap
    public backgroundOverlay: MapEditorBackgroundOverlay;
    public camera: Entity;
    public menuOverlay: PauseOverlay;
    public toolManager: ToolManager;
    public eventContainer: EventOverlay;
    public toolSettingsView: ToolSettingsView;
    public toolbar: ToolbarView;
    private worldAlive: boolean;
    private cameraMovementEnabled = true
    private cameraZoomEnabled = true
    private needsRedraw = true
    private controlsResponder = new ControlsResponder()

    constructor() {
        super()
        this.setTitle("Танчики - Редактор карт")

        this.world = new Entity()
        clientGameWorldEntityPrefab(this.world, {})

        this.camera = new Entity()
        this.camera.addComponent(new TransformComponent())
        this.camera.addComponent(new CameraComponent())
        this.camera.addComponent(new CameraPositionController())
        this.camera.addComponent(new WorldDrawerComponent(this.screen))
        this.camera.addComponent(new WorldSoundListenerComponent(this.screen.soundEngine))

        this.backgroundOverlay = new MapEditorBackgroundOverlay()
        this.backgroundOverlay.matrix = this.camera.getComponent(CameraComponent).inverseMatrix
        this.overlayContainer.append(this.backgroundOverlay.element)
        this.backgroundOverlay.draggingEnabled = false
        this.backgroundOverlay.show()

        this.setupWorkspace()

        this.menuOverlay = new PauseOverlay({
            rootController: new MapEditorPauseMainController(),
            gameControls: this.controlsResponder
        })
        this.overlayContainer.append(this.menuOverlay.element)

        this.menuOverlay.on("open", (map) => {
            this.map = map
            this.world.getComponent(TilemapComponent).setMap(this.map)
            this.toolManager.world.getComponent(TilemapComponent).setMap(this.map)

            if (map) {
                let target = {
                    x: this.map.width * GameMap.BLOCK_SIZE / 2,
                    y: this.map.height * GameMap.BLOCK_SIZE / 2
                }
                this.camera.getComponent(CameraPositionController).setTarget(target).reset()
                this.menuOverlay.hide()
            } else {
                this.camera.getComponent(CameraPositionController).setTarget(null)
            }

            this.setNeedsRedraw()
        })

        this.backgroundOverlay.on("drag", (dx, dy) => {
            if (this.map && this.cameraMovementEnabled) {
                let camera = this.camera.getComponent(CameraPositionController)
                camera.target.x += dx
                camera.target.y += dy
                this.setNeedsRedraw()
            }
        })

        this.backgroundOverlay.on("zoom", (zoom) => {
            if (this.map && this.cameraZoomEnabled) {
                let camera = this.camera.getComponent(CameraPositionController)
                camera.baseScale *= zoom;
                this.setNeedsRedraw()
            }
        })

        this.backgroundOverlay.on("mousemove", (x, y) => {
            this.toolManager.mouseMove(x, y)
        })

        this.backgroundOverlay.on("mousedown", (x, y) => {
            this.toolManager.mouseDown(x, y)
        })

        this.backgroundOverlay.on("mouseup", (x, y) => {
            this.toolManager.mouseUp(x, y)
        })

        this.controlsResponder.on("editor-undo", (event) => {
            const history = this.map.getComponent(GameMapHistoryComponent)
            let entry = history.goBack()

            if (entry) this.eventContainer.createEvent("Отменено: " + entry.actionName)
            else this.eventContainer.createEvent("Нечего отменять")
        })

        this.controlsResponder.on("editor-redo", (event) => {
            const history = this.map.getComponent(GameMapHistoryComponent)
            let entry = history.goForward()

            if (entry) this.eventContainer.createEvent("Повторено: " + entry.actionName)
            else this.eventContainer.createEvent("Нечего повторять")
        })

        // this.controlsEventHandler.on("editor-save-maps", (event) => {
        //     if(this.menuOverlay.saveMaps()) {
        //         this.eventContainer.createEvent("Карты сохранены")
        //     } else {
        //         this.eventContainer.createEvent("Карты не сохранились. Что-то сломалось. Грр. Скачай карту ручками и покажи Артему чем насрало в консоль.")
        //     }
        // })
    }

    setupWorkspace() {
        this.toolSettingsView = new ToolSettingsView()
        this.toolManager = new ToolManager(this.world)
        this.toolManager.on("camera-movement", (enabled) => this.setCameraMovementEnabled(enabled))
        this.toolManager.on("world-alive", (alive) => this.setWorldAlive(alive))
        this.toolManager.on("user-event", (text) => this.eventContainer.createEvent(text))
        this.toolManager.on("redraw", () => {
            this.setNeedsRedraw()
        })

        this.toolbar = new ToolbarView({
            root: this.overlayContainer
        })

        this.toolbar.on("tool-select", (tool) => {
            this.backgroundOverlay.draggingEnabled = !tool.locksDragging
            this.toolSettingsView.setupTool(tool)
            this.toolManager.selectTool(tool)
        })

        this.toolbar.on("block-select", (block) => {
            this.toolManager.selectBlock(block)
        })

        this.toolbar.loadSavedBlock()

        Tools.map(Tool => new Tool(this.toolManager))
            .forEach((tool) => this.toolbar.addTool(tool))

        this.eventContainer = new EventOverlay()
        this.overlayContainer.append(this.toolSettingsView.element)
        this.overlayContainer.append(this.toolbar.element)
        this.overlayContainer.append(this.eventContainer.element)
    }

    layout() {
        super.layout();
        this.camera.getComponent(CameraPositionController).setViewport({
            x: this.screen.width,
            y: this.screen.height
        })
    }

    draw(dt: number) {
        super.draw(dt)

        if (!this.map || !this.needsRedraw) return

        if (this.worldAlive) {
            this.world.emit("tick", dt)
        }
        this.world.emit("draw")
        if (this.worldAlive) this.setNeedsRedraw()
    }

    setWorldAlive(alive: boolean) {
        this.worldAlive = alive
        this.setNeedsRedraw()
    }

    setNeedsRedraw() {
        this.needsRedraw = true
    }

    setCameraMovementEnabled(enabled: boolean) {
        this.cameraMovementEnabled = enabled
    }

    appear() {
        super.appear();

        this.world.appendChild(this.camera)

        RootControlsResponder.getInstance().setMainResponderDelayed(this.controlsResponder)

        this.layout()
    }

    disappear() {
        super.disappear();

        this.camera.removeFromParent()

        RootControlsResponder.getInstance().setMainResponderDelayed(null)
    }
}