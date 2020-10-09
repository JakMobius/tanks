/* @load-resource: '../style.css' */

const Scene = require("../../scenes/scene")
const MapDrawer = require("../../graphics/drawers/mapdrawer")
const Camera = require("../../camera")
const MenuOverlay = require("../ui/overlay/menu/menuoverlay")
const Box2D = require("../../../library/box2d")
const GameMap = require("../../../utils/map/gamemap")
const KeyboardController = require("../../controls/interact/keyboardcontroller")
const DragHandler = require("../../controls/interact/draghandler")
const ToolbarView = require("../ui/overlay/workspace/toolbar/toolbar")
const ToolManager = require("../tools/toolmanager")
const EventContainer = require("../../ui/overlay/events/eventcontainer")
const ToolSettingsView = require("../ui/overlay/workspace/toolsettings/toolsettingsview")

class MapEditorScene extends Scene {

    constructor(config) {
        super(config)
        this.time = 0
        this.progress = config.progress
        this.keyboard = new KeyboardController()
        this.keyboard.startListening()
        this.map = null

        this.dragHandler = new DragHandler(this.screen.canvas)
        this.dragHandler.draggingEnabled = false
        this.dragHandler.startListening()

        this.camera = new Camera({
            baseScale: 1,
            viewport: new Box2D.b2Vec2(0, 0),
            defaultPosition: new Box2D.b2Vec2(0, 0),
            limit: false
        })
        this.camera.intertial = false

        this.setupWorkspace()

        this.mapDrawer = new MapDrawer(this.camera, this.screen.ctx)

        this.menuOverlay = new MenuOverlay({
            root: this.overlayContainer
        })

        this.menuOverlay.on("open", (map) => {
            this.map = map
            this.toolManager.map = map
            this.mapDrawer.reset()

            if(this.map) {
                if(!this.camera.target) {
                    this.camera.target = new Box2D.b2Vec2(0, 0)
                }
                this.camera.target.x = this.map.width * GameMap.BLOCK_SIZE / 2
                this.camera.target.y = this.map.height * GameMap.BLOCK_SIZE / 2
                this.camera.reset()
                this.menuOverlay.hide()
            } else {
                this.camera.target = null
            }

            this.screen.loop.start()
        })

        this.dragHandler.on("drag", (dx, dy) => {
            if(this.map) {
                this.camera.target.x += dx / this.camera.baseScale
                this.camera.target.y += dy / this.camera.baseScale
                this.screen.loop.start()
            }
        })

        this.dragHandler.on("zoom", (zoom) => {
            if(this.map) {
                this.camera.baseScale *= zoom;
                this.screen.loop.start()
            }
        })

        this.keyboard.keybinding("Escape", (event) => {
            if (this.menuOverlay.shown) {
                this.menuOverlay.hide()
            } else {
                this.menuOverlay.redraw()
                this.menuOverlay.show()
            }
        })

        this.keyboard.keybinding("Cmd-Z", (event) => {
            let entry = this.map.history.goBack()

            if(entry) this.eventContainer.createEvent("Отменено: " + entry.actionName)
            else this.eventContainer.createEvent("Нечего отменять")

            this.setNeedsRedraw(true)
        })

        this.keyboard.keybinding("Cmd-Y", (event) => {
            let entry = this.map.history.goForward()

            if(entry) this.eventContainer.createEvent("Повторено: " + entry.actionName)
            else this.eventContainer.createEvent("Нечего повторять")

            this.setNeedsRedraw(true)
        })

        this.keyboard.keybinding("Cmd-S", (event) => {
            if(this.menuOverlay.saveMaps()) {
                this.eventContainer.createEvent("Карты сохранены")
            } else {
                this.eventContainer.createEvent("Карты не сохранились. Что-то сломалось. Грр. Скачай карту ручками и покажи Артему чем насрало в консоль.")
            }
        })

        this.menuOverlay.show()
        this.layout()
    }

    setNeedsRedraw(force) {
        if(force) this.mapDrawer.reset()
        this.screen.loop.start()
    }

    setupWorkspace() {
        this.eventContainer = new EventContainer()
        this.toolSettingsView = new ToolSettingsView()
        this.toolManager = new ToolManager(this.screen, this.camera, this.map)
        this.toolManager.on("redraw", (force) => this.setNeedsRedraw(force))
        this.toolManager.on("event", (text) => this.eventContainer.createEvent(text))
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

        require("../tools/types/")
            .map(Tool => new Tool(this.toolManager))
            .forEach((tool) => this.toolbar.addTool(tool))

        this.overlayContainer.append(this.toolSettingsView.element)
        this.overlayContainer.append(this.toolbar.element)
        this.overlayContainer.append(this.eventContainer.element)
    }

    layout() {
        super.layout();
        this.screen.loop.start()
        this.camera.viewport.x = this.screen.width
        this.camera.viewport.y = this.screen.height
    }

    draw(ctx, dt) {
        if(!this.map) return

        this.camera.tick(dt)
        this.mapDrawer.draw(this.map)
        if(this.toolManager.selectedTool) {
            this.toolManager.selectedTool.drawDecorations()
        }
    }
}

module.exports = MapEditorScene