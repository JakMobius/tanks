import EventOverlay from "src/client/ui/overlay/events-overlay/event-overlay";
import ChatContainer from "src/client/ui/overlay/chat-overlay/chat-container";
import WorldDrawerComponent from "../entity/components/world-drawer-component";
import GameMap from "src/map/game-map";
import Scene from "../scenes/scene";
import PauseOverlay from "src/client/ui/overlay/pause-overlay/pause-overlay";
import PhysicalComponent from "src/entity/components/physics-component";
import TilemapComponent from "src/physics/tilemap-component";
import TankControls from "src/controls/tank-controls";
import RootControlsResponder, {ControlsResponder} from "src/client/controls/root-controls-responder";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import PlayerListOverlay from "src/client/ui/overlay/player-list-overlay/player-list-overlay";
import {Constructor} from "src/utils/constructor"
import GameOverlay from "src/client/ui/overlay/game-overlay/game-overlay";
import Entity from "src/utils/ecs/entity";
import PlayerNickOverlay from "src/client/ui/overlay/player-nick-overlay/player-nick-overlay";
import Overlay from "../ui/overlay/overlay";
import TankSelectOverlay from "src/client/ui/overlay/tank-select-overlay/tank-select-overlay";
import WorldSoundListenerComponent from "src/client/entity/components/sound/world-sound-listener-component";
import TankInfoOverlay from "src/client/ui/overlay/tank-info-overlay/tank-info-overlay";
import CameraComponent from "src/client/graphics/camera";
import TransformComponent from "src/entity/components/transform-component";
import CameraPositionController from "src/entity/components/camera-position-controller";
import PrimaryPlayerReceiver from "src/entity/components/network/primary-player/primary-player-receiver";

import React from "react";
import GamePauseView from "./game-pause-view";

export default class GeneralGameScene extends Scene {
    public camera: Entity | null = null

    public eventContainer: EventOverlay
    public chatContainer: ChatContainer
    public displayedWorld: Entity
    public controlledTank: Entity

    public paused: boolean = false
    public didChangeSize: boolean = false
    protected pauseOverlay?: PauseOverlay
    protected playerListOverlay?: PlayerListOverlay
    protected playerNickOverlay?: PlayerNickOverlay
    protected tankSelectOverlay?: TankSelectOverlay
    protected tankInfoOverlay?: TankInfoOverlay
    protected modeSpecificOverlay?: Overlay

    protected worldEventListener = new BasicEventHandlerSet()
    private gameOverlays = new Map<Constructor<GameOverlay>, GameOverlay>()
    private appeared: boolean = false

    protected controlsResponder = new ControlsResponder()

    constructor() {
        super()

        this.setupControls()
        this.setupTankInfoOverlay()
        this.setupEventContainer()
        this.setupPlayerNickOverlay()
        this.setupPlayerListOverlay()
        this.setupModeSpecificOverlays()
        this.setupChat()
        this.setupTankSelectOverlay()
        this.setupPauseOverlay()
        this.setupWorldEvents()
    }

    private setupCamera() {
        this.camera = new Entity()
        this.camera.addComponent(new TransformComponent())
        this.camera.addComponent(new CameraComponent())
        this.camera.addComponent(new CameraPositionController()
            .setBaseScale(12)
            .setViewport({x: this.screen.width, y: this.screen.height}))

        this.camera.addComponent(new WorldSoundListenerComponent(this.screen.soundEngine))
        this.camera.addComponent(new WorldDrawerComponent(this.screen))
    }

    private setupControls() {
        this.controlsResponder.on("game-toggle-debug", () => {
            this.camera.getComponent(WorldDrawerComponent).toggleDebugDraw()
        })
    }

    private setupWorldEvents() {
        this.worldEventListener.on("map-change", () => {
            const map = this.displayedWorld.getComponent(TilemapComponent).map
            let position = {
                x: map.width / 2 * GameMap.BLOCK_SIZE,
                y: map.height / 2 * GameMap.BLOCK_SIZE
            }
            this.camera.getComponent(CameraPositionController).setDefaultPosition(position)
        })

        this.worldEventListener.on("primary-entity-set", (entity: Entity) => {
            this.onWorldPrimaryEntitySet(entity)
        })

        this.worldEventListener.on("overlay-data", (overlayClass: Constructor<GameOverlay>, data: any) => {
            this.handleOverlayData(overlayClass, data)
        })

        // this.worldEventListener.on("user-message", (message: EventView) => {
        //     this.eventContainer.createEvent(message)
        // })

        this.worldEventListener.on("choose-tank", () => {
            this.tankSelectOverlay.show()
            // this.tankSelectOverlay.requireTankSelection()
        })
    }

    private setupEventContainer() {
        this.eventContainer = new EventOverlay()
        this.overlayContainer.append(this.eventContainer.element)
    }

    private setupChat() {
        this.chatContainer = new ChatContainer()
        this.overlayContainer.append(this.chatContainer.element)

        this.controlsResponder.on("game-chat", () => {
            if (this.displayedWorld) {
                // this.chatContainer.showInput()
            }
        })

        // this.chatContainer.on("chat", (text: string) => {
        //     this.onChat(text)
        // })
    }

    displayWorld(world: Entity) {
        this.camera.removeFromParent()

        this.displayedWorld = world

        if (this.displayedWorld) {
            this.displayedWorld.appendChild(this.camera)
            this.onWorldPrimaryEntitySet(this.displayedWorld.getComponent(PrimaryPlayerReceiver).primaryEntity)
        }

        this.worldEventListener.setTarget(this.displayedWorld)

        this.playerListOverlay.setGameWorld(world)
        this.playerNickOverlay.setGameWorld(world)
        this.tankInfoOverlay.setGameWorld(world)
    }

    layout() {
        let cameraComponent = this.camera.getComponent(CameraPositionController)
        cameraComponent.setViewport({x: this.screen.width, y: this.screen.height})
        this.didChangeSize = true
    }

    draw(dt: number) {
        super.draw(dt)
        this.screen.clear()
        this.didChangeSize = false
        if (this.paused) {
            if (this.didChangeSize) {
                this.displayedWorld.emit("draw")
            }
            return
        }

        if (!this.displayedWorld) return

        this.tick(dt)
        this.displayedWorld.emit("draw")
    }

    tick(dt: number) {

    }

    protected onWorldPrimaryEntitySet(entity: Entity) {
        if (this.controlledTank) {
            this.controlsResponder.disconnectTankControls(this.controlledTank.getComponent(TankControls))
        }

        this.controlledTank = entity

        if (entity) {
            let body = entity.getComponent(PhysicalComponent).getBody()
            this.camera.getComponent(CameraPositionController)
                .setTarget(body.GetPosition())
                .setTargetVelocity(body.GetLinearVelocity())
                .update()
                .setInertial(true)

            this.controlsResponder.connectTankControls(entity.getComponent(TankControls))
        } else {
            this.camera.getComponent(CameraPositionController)
                .setTarget(null)
                .setTargetVelocity(null)
                .setInertial(false)
        }
    }

    private setupPauseOverlay() {
        this.pauseOverlay = new PauseOverlay({
            rootComponent: <GamePauseView/>,
            gameControls: this.controlsResponder
        })
        this.overlayContainer.append(this.pauseOverlay.element)

        this.pauseOverlay.on("open", () => {
            this.screen.soundEngine.setEnabled(false)
        })
        this.pauseOverlay.on("close", () => {
            this.screen.soundEngine.setEnabled(true)
        })
    }

    private setupPlayerListOverlay() {
        this.playerListOverlay = new PlayerListOverlay({
            gameControls: this.controlsResponder
        })
        this.overlayContainer.append(this.playerListOverlay.element)
    }

    private setupPlayerNickOverlay() {
        this.playerNickOverlay = new PlayerNickOverlay()
        this.overlayContainer.append(this.playerNickOverlay.element)
    }

    private setupTankSelectOverlay() {
        this.tankSelectOverlay = new TankSelectOverlay({
            gameControls: this.controlsResponder
        })
        this.overlayContainer.append(this.tankSelectOverlay.element)
        this.tankSelectOverlay.on("confirm", (tank: number) => {
            this.onTankSelected(tank)
        })
    }

    private setupTankInfoOverlay() {
        this.tankInfoOverlay = new TankInfoOverlay()
        this.overlayContainer.append(this.tankInfoOverlay.element)
    }

    private setupModeSpecificOverlays() {
        this.modeSpecificOverlay = new Overlay()
        this.overlayContainer.append(this.modeSpecificOverlay.element)
        this.modeSpecificOverlay.show()
    }

    private getModeSpecificOverlay(overlayClass: Constructor<GameOverlay>) {
        let overlay = this.gameOverlays.get(overlayClass)
        if (!overlay) {
            overlay = new overlayClass({
                world: this.displayedWorld
            })
            this.modeSpecificOverlay.element.append(overlay.element)
            this.gameOverlays.set(overlayClass, overlay)
        }
        return overlay
    }

    private handleOverlayData(overlayClass: Constructor<GameOverlay>, data: any) {
        this.getModeSpecificOverlay(overlayClass).setData(data)
    }

    appear() {
        super.appear();
        this.setupCamera()
        this.appeared = true

        this.playerNickOverlay.setCamera(this.camera.getComponent(CameraComponent))
        this.playerNickOverlay.setScreen(this.screen)

        RootControlsResponder.getInstance().setMainResponderDelayed(this.controlsResponder)

        this.layout()
    }

    disappear() {
        super.disappear();

        // Hide the pause overlay (let its controllers understand that they are disappearing)
        this.pauseOverlay.hide()

        // TODO: it's not really intuitive that displayed world should
        // be set to null when the scene disappears. It's probably better
        // to have the scene keep track of the world it's displaying.
        // This issue is related with the above issue of adding and removing
        // components in displayWorld. Maybe both of these issues can be
        // resolved at once by making WorldDrawerComponent and
        // WorldSoundListenerComponent more flexible.
        this.displayWorld(null)
        this.appeared = false

        RootControlsResponder.getInstance().setMainResponderDelayed(null)
    }

    protected onChat(text: string) {

    }

    protected onTankSelected(tank: number) {

    }
}