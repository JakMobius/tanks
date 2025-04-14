import React, { useEffect, useRef } from "react";
import { SceneContainer, useScene } from "src/client/scenes/scene-controller";
import EmbeddedServerGame from "src/client/embedded-server/embedded-server-game";
import WorldDataPacket from "src/networking/packets/game-packets/world-data-packet";
import EntityDataReceiveComponent from "src/entity/components/network/receiving/entity-data-receive-component";
import RemoteControlsManager from "src/client/controls/remote-controls-manager";
import Entity from "src/utils/ecs/entity";
import { KeyedComponentsHandle } from "src/client/utils/keyed-component";
import RootControlsResponder, { ControlsResponder } from "src/client/controls/root-controls-responder";
import CameraComponent from "src/client/graphics/camera";
import { gameEntityFactory } from "src/client/game/game-entity-factory";
import WriteBuffer from "src/serialization/binary/write-buffer";
import TransformComponent from "src/entity/components/transform/transform-component";
import CameraPositionController from "src/entity/components/camera-position-controller";
import CameraPrimaryEntityController from "src/entity/components/camera-primary-entity-watcher";
import WorldSoundListenerComponent from "src/client/entity/components/sound/world-sound-listener-component";
import WorldDrawerComponent from "src/client/entity/components/world-drawer-component";
import PrimaryEntityControls from "src/entity/components/primary-entity-controls";
import Sprite from "src/client/graphics/sprite";
import GameHUD, { GameHudListenerComponent } from "src/client/ui/game-hud/game-hud";
import { ControlsProvider } from "src/client/utils/react-controls-responder";
import EventsHUD, { EventsProvider } from "src/client/ui/events-hud/events-hud";
import PlayerNicksHUD from "src/client/ui/player-nicks-hud/player-nicks-hud";
import TankInfoHUD from "src/client/ui/tank-info-hud/tank-info-hud";
import PauseOverlay from "src/client/ui/pause-overlay/pause-overlay";
import GamePauseView from "src/client/game/game-pause-view";
import { SoundResourcePrerequisite, TexturesResourcePrerequisite, usePrerequisites } from "src/client/scenes/scene-prerequisite";
import LoadingScene from "src/client/scenes/loading/loading-scene";
import PreviewWorldController from "./world-controller";
import GearboxUnit, { GearboxUnitConfig } from "src/entity/components/transmission/units/gearbox-unit";
import TankEngineUnit, { EngineConfig } from "src/entity/components/transmission/units/tank-engine-unit";
import PrefabComponent from "src/entity/components/prefab-id-component";
import TransmissionComponent from "src/entity/components/transmission/transmission-component";

interface PreviewViewProps {
    engineConfig: EngineConfig;
    gearboxConfig: GearboxUnitConfig
}

const PreviewView: React.FC<PreviewViewProps> = (props) => {
    const scene = useScene()

    const [state, setState] = React.useState({
        camera: null as Entity | null,
        remoteControlsManager: null as RemoteControlsManager | null,
        game: null as EmbeddedServerGame | null,
        worldController: null as PreviewWorldController | null,
    })

    const eventContextRef = useRef<KeyedComponentsHandle | null>(null)
    const gameHudRef = useRef<KeyedComponentsHandle | null>(null)
    const controlsResponderRef = useRef<ControlsResponder | null>(null)

    const onDraw = (dt: number) => {
        RootControlsResponder.getInstance().refresh()
        state.remoteControlsManager?.updateIfNeeded()
        state.camera?.getComponent(CameraComponent)
            .setViewport({ x: scene.canvas.width, y: scene.canvas.height })
        state.game?.tick(dt)
        state.game?.clientWorld.emit("draw")
    }

    useEffect(() => {
        scene.setTitle("Танчики - Туториал")
        scene.loop.start()
        scene.canvas.clear()

        const game = new EmbeddedServerGame()
        game.clientWorld.getComponent(EntityDataReceiveComponent).makeRoot(gameEntityFactory)
        const worldController = new PreviewWorldController(game.serverWorld)
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
        camera.addComponent(new CameraComponent()
            .setViewport({ x: screen.width, y: screen.height }))
        camera.addComponent(new CameraPositionController()
            .setBaseScale(12))
        camera.addComponent(new CameraPrimaryEntityController())
        camera.addComponent(new WorldSoundListenerComponent(scene.soundEngine))
        camera.addComponent(new WorldDrawerComponent(scene.canvas))

        game.clientWorld.addComponent(new PrimaryEntityControls(controlsResponderRef.current))
        game.clientWorld.appendChild(camera)

        // TODO: otherwise the player spawns in the (0, 0)
        game.serverLoop.timePassed(1)

        game.connectClientToServer()

        setState((state) => ({
            ...state,
            camera: camera,
            game: game,
            worldController,
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
        if(!state.game) return
        let updateSettings = (entity: Entity) => {
            let transmission = entity.getComponent(TransmissionComponent)
            if(!transmission) return

            for(let unit of transmission.units) {
                if(unit instanceof GearboxUnit) {
                    unit.setConfig(props.gearboxConfig)
                }
                if(unit instanceof TankEngineUnit) {
                    unit.setConfig(props.engineConfig)
                }
            } 
        }
        let traverse = (entity: Entity) => {
            updateSettings(entity)
            entity.children.forEach(traverse)
        }

        traverse(state.game.clientWorld)
        traverse(state.game.serverWorld)
    }, [state.game, state.worldController, props.engineConfig, props.gearboxConfig])

    useEffect(() => {
        scene.loop.on("tick", onDraw)
        return () => scene.loop.off("tick", onDraw)
    }, [onDraw])

    useEffect(() => {
        if (!state.game?.clientWorld) return undefined
        const onEventView = (message: React.FC, props: any) => {
            eventContextRef.current?.addEvent(message, props)
        }
        state.game.clientWorld.on("event-view", onEventView)
        return () => state.game.clientWorld.off("event-view", onEventView)
    }, [eventContextRef.current])

    useEffect(() => {
        let world = state.game?.clientWorld
        if (!world) return undefined
        world?.getComponent(GameHudListenerComponent).setHud(gameHudRef.current)
        return () => world?.getComponent(GameHudListenerComponent).setHud(null)
    }, [gameHudRef.current, state])

    return (
        <ControlsProvider default>
            <ControlsProvider default ref={controlsResponderRef}/>
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

interface PreviewSceneProps {
    engineConfig: EngineConfig;
    gearboxConfig: GearboxUnitConfig
}

const PreviewScene: React.FC<PreviewSceneProps> = (props) => {
    const prerequisites = usePrerequisites(() => [
        new TexturesResourcePrerequisite(),
        new SoundResourcePrerequisite()
    ])

    if (prerequisites.loaded) {
        return <PreviewView engineConfig={props.engineConfig} gearboxConfig={props.gearboxConfig}/>
    } else {
        return <LoadingScene progress={prerequisites.progress} error={prerequisites.error} />
    }
}

interface GamePreviewComponentProps {
    engineConfig: EngineConfig;
    gearboxConfig: GearboxUnitConfig
}

const GamePreviewComponent: React.FC<GamePreviewComponentProps> = (props) => {
    return (
        <SceneContainer setTitle={() => {}}>
            <PreviewScene engineConfig={props.engineConfig} gearboxConfig={props.gearboxConfig}/>
        </SceneContainer>
    );
}

export default GamePreviewComponent;