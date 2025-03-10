
import EmbeddedServerGame from "src/client/embedded-server/embedded-server-game";
import TutorialWorldController from "src/client/tutorial/tutorial-world-controller";
import WorldDataPacket from "src/networking/packets/game-packets/world-data-packet";
import ReadBuffer from "src/serialization/binary/read-buffer";
import EntityDataReceiveComponent from "src/entity/components/network/receiving/entity-data-receive-component";
import RemoteControlsManager from "src/client/controls/remote-controls-manager";
import SceneController, { useScene } from "../scenes/scene-controller";
import { SoundResourcePrerequisite, TexturesResourcePrerequisite, usePrerequisites } from "../scenes/scene-prerequisite";
import Entity from "src/utils/ecs/entity";
import TransformComponent from "src/entity/components/transform-component";
import CameraComponent from "../graphics/camera";
import WorldDrawerComponent from "../entity/components/world-drawer-component";
import CameraPositionController from "src/entity/components/camera-position-controller";
import WorldSoundListenerComponent from "../entity/components/sound/world-sound-listener-component";
import RootControlsResponder, { ControlsResponder } from "../controls/root-controls-responder";
import PlayerTankSelectPacket from "src/networking/packets/game-packets/player-tank-select-packet";
import TankInfoHUD from "../ui/tank-info-hud/tank-info-hud";
import PlayerNicksHUD from "../ui/player-nicks-hud/player-nicks-hud";
import GamePauseView from "../game/game-pause-view";
import PauseOverlay from "../ui/pause-overlay/pause-overlay";
import CameraPrimaryEntityController from "src/entity/components/camera-primary-entity-watcher";
import PrimaryEntityControls from "src/entity/components/primary-entity-controls";
import React, { useEffect, useRef } from "react"
import EventsHUD, { EventsProvider } from "../ui/events-hud/events-hud";
import { KeyedComponentsHandle } from "../utils/keyed-component";
import LoadingScene from "../scenes/loading/loading-scene";
import Sprite from "../graphics/sprite";
import WriteBuffer from "src/serialization/binary/write-buffer";
import GameHUD, { GameHudListenerComponent } from "../ui/game-hud/game-hud";
import { ControlsProvider } from "../utils/react-controls-responder";

const TutorialView: React.FC = () => {
    const scene = useScene()

    const [state, setState] = React.useState({
        camera: null as Entity | null,
        remoteControlsManager: null as RemoteControlsManager | null,
        game: null as EmbeddedServerGame | null,
    })

    const eventContextRef = useRef<KeyedComponentsHandle | null>(null)
    const gameHudRef = useRef<KeyedComponentsHandle | null>(null)
    const controlsResponderRef = useRef<ControlsResponder | null>(null)

    const onDraw = (dt: number) => {
        RootControlsResponder.getInstance().refresh()
        state.remoteControlsManager?.updateIfNeeded()
        state.camera?.getComponent(CameraPositionController)
            .setViewport({ x: scene.canvas.width, y: scene.canvas.height })
        state.game?.tick(dt)
        state.game?.clientWorld.emit("draw")
    }

    const onTankSelected = (tank: number) => {
        new PlayerTankSelectPacket(tank).sendTo(state.game.clientConnection.connection)
    }

    useEffect(() => {
        scene.setTitle("Танчики - Туториал")
        scene.loop.start()
        scene.canvas.clear()

        const game = new EmbeddedServerGame()
        const worldController = new TutorialWorldController(game.serverGame)
        const remoteControlsManager = new RemoteControlsManager(controlsResponderRef.current, game.clientConnection.connection)

        game.clientConnection.on(WorldDataPacket, (packet) => {
            game.clientWorld.getComponent(EntityDataReceiveComponent).receivePacket(packet)
        })

        game.clientWorld.on("response", (buffer: WriteBuffer) => {
            new WorldDataPacket(buffer.buffer).sendTo(game.clientConnection.connection)
        })

        remoteControlsManager.attach()

        const camera = new Entity()

        camera.addComponent(new TransformComponent())
        camera.addComponent(new CameraComponent())
        camera.addComponent(new CameraPositionController()
            .setBaseScale(12)
            .setViewport({ x: screen.width, y: screen.height }))
        camera.addComponent(new CameraPrimaryEntityController())
        camera.addComponent(new WorldSoundListenerComponent(scene.soundEngine))
        camera.addComponent(new WorldDrawerComponent(scene.canvas))

        game.clientWorld.addComponent(new PrimaryEntityControls(controlsResponderRef.current))
        game.clientWorld.appendChild(camera)

        game.connectClientToServer()

        setState((state) => ({
            ...state,
            camera: camera,
            game: game,
            remoteControlsManager: remoteControlsManager,
        }))

        return () => {
            scene.setTitle(undefined)
            scene.loop.stop()
            camera.removeFromParent()
        }
    }, [])

    useEffect(() => {
        let texture = Sprite.applyTexture(scene.canvas.ctx)
        return () => Sprite.cleanupTexture(scene.canvas.ctx, texture)
    }, [])

    useEffect(() => {
        scene.loop.on("tick", onDraw)
        return () => scene.loop.off("tick", onDraw)
    }, [onDraw])

    useEffect(() => {
        if (!state.game.clientWorld) return undefined
        const onEventView = (message: React.FC, props: any) => {
            eventContextRef.current?.addEvent(message, props)
        }
        state.game.clientWorld.on("event-view", onEventView)
        return () => state.game.clientWorld.off("event-view", onEventView)
    }, [eventContextRef.current])

    useEffect(() => {
        let world = state.game.clientWorld
        world?.getComponent(GameHudListenerComponent).setHud(gameHudRef.current)
        return () => world?.getComponent(GameHudListenerComponent).setHud(null)
    }, [gameHudRef.current])

    return (
        <ControlsProvider ref={controlsResponderRef}>
            <EventsProvider ref={eventContextRef}>
                <PlayerNicksHUD world={state.game?.clientWorld} screen={scene.canvas} camera={state.camera} />
                <TankInfoHUD world={state.game?.clientWorld} />
                <EventsHUD />
                <GameHUD keyedComponentsRef={gameHudRef} />
                <PauseOverlay rootComponent={<GamePauseView />}/>
            </EventsProvider>
        </ControlsProvider>
    )
}

const TutorialScene: React.FC = () => {
    const prerequisites = usePrerequisites(() => [
        new TexturesResourcePrerequisite(),
        new SoundResourcePrerequisite()
    ])

    if (prerequisites.loaded) {
        return <TutorialView />
    } else {
        return <LoadingScene progress={prerequisites.progress} error={prerequisites.error} />
    }
}

SceneController.shared.registerScene("tutorial", TutorialScene);