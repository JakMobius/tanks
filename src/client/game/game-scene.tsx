import ConnectionClient from "src/networking/connection-client";
import WorldDataPacket from "src/networking/packets/game-packets/world-data-packet";
import EntityDataReceiveComponent from "src/entity/components/network/receiving/entity-data-receive-component";
import ReadBuffer from "src/serialization/binary/read-buffer";
import Entity from "src/utils/ecs/entity";
import {clientGameWorldEntityPrefab} from "src/client/entity/client-game-world-entity-prefab";
import PlayerTankSelectPacket from "src/networking/packets/game-packets/player-tank-select-packet";
import RemoteControlsManager from "src/client/controls/remote-controls-manager";
import SceneController, { useScene } from '../scenes/scene-controller';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import RootControlsResponder, { ControlsResponder } from '../controls/root-controls-responder';
import TransformComponent from 'src/entity/components/transform/transform-component';
import CameraComponent from '../graphics/camera';
import CameraPositionController from 'src/entity/components/camera-position-controller';
import CameraPrimaryEntityController from 'src/entity/components/camera-primary-entity-watcher';
import WorldSoundListenerComponent from '../entity/components/sound/world-sound-listener-component';
import WorldDrawerComponent from '../entity/components/world-drawer-component';
import PlayerNicksHUD from '../ui/player-nicks-hud/player-nicks-hud';
import TankInfoHUD from '../ui/tank-info-hud/tank-info-hud';
import PauseOverlay from '../ui/pause-overlay/pause-overlay';
import GamePauseView from './game-pause-view';
import { convertErrorToLoadingError, LoadingError, BasicMessageLoadingError } from '../scenes/loading/loading-error';
import PrimaryEntityControls from 'src/entity/components/primary-entity-controls';
import TankSelectOverlay, { TankSelectOverlayHandle } from '../ui/tank-select-overlay/tank-select-overlay';
import PlayerListHUD from '../ui/player-list-hud/player-list-hud';
import EventsHUD, { EventsProvider } from '../ui/events-hud/events-hud';
import GameHUD, { GameHudListenerComponent } from '../ui/game-hud/game-hud';
import { KeyedComponentsHandle } from '../utils/keyed-component';
import LoadingScene from '../scenes/loading/loading-scene';
import { SocketConnectionPrerequisite, SoundResourcePrerequisite, TexturesResourcePrerequisite, usePrerequisites } from '../scenes/scene-prerequisite';
import Sprite from '../graphics/sprite';
import WriteBuffer from 'src/serialization/binary/write-buffer';
import { ControlsProvider } from "../utils/react-controls-responder";
import { EntityPrefab } from "src/entity/entity-prefabs";

export interface GameViewConfig {
    client: ConnectionClient
    onError: (error: any) => void
}

const GameView: React.FC<GameViewConfig> = (props) => {
    const controlsUpdateInterval = 0.05

    const scene = useScene()
    const eventContextRef = useRef<KeyedComponentsHandle | null>(null)
    const gameHudRef = useRef<KeyedComponentsHandle | null>(null)
    const tankSelectRef = useRef<TankSelectOverlayHandle | null>(null)
    const controlsResponderRef = useRef<ControlsResponder | null>(null)

    const [state, setState] = React.useState({
        camera: null as Entity | null,
        world: null as Entity | null,
        remoteControlsManager: null as RemoteControlsManager | null
    })

    const onDraw = (dt: number) => {
        RootControlsResponder.getInstance().refresh()
        state.camera?.getComponent(CameraPositionController)
            .setViewport({ x: scene.canvas.width, y: scene.canvas.height })
        state.world?.emit("tick", dt)
        state.world?.emit("draw")
    }

    const onTankSelected = useCallback((tank: EntityPrefab) => {
        new PlayerTankSelectPacket(tank.id).sendTo(props.client.connection)
    }, [props.client])

    useEffect(() => {
        scene.setTitle("Танчики")
        scene.loop.start()
        scene.canvas.clear()

        const world = new Entity()
        const camera = new Entity()
        const remoteControlsManager = new RemoteControlsManager(controlsResponderRef.current, props.client.connection)
        
        clientGameWorldEntityPrefab(world, {})
        world.addComponent(new PrimaryEntityControls(controlsResponderRef.current))

        remoteControlsManager.attach()

        controlsResponderRef.current.on("game-toggle-debug", () => {
            camera.getComponent(WorldDrawerComponent).toggleDebugDraw()
        })

        props.client.on(WorldDataPacket, (packet) => {
            world.getComponent(EntityDataReceiveComponent).receivePacket(packet)
        })

        world.on("response", (buffer: WriteBuffer) => {
            new WorldDataPacket(buffer.spitBuffer()).sendTo(props.client.connection)
        })

        camera.addComponent(new TransformComponent())
        camera.addComponent(new CameraComponent())
        camera.addComponent(new CameraPositionController()
            .setBaseScale(12)
            .setViewport({ x: screen.width, y: screen.height }))
        camera.addComponent(new CameraPrimaryEntityController())
        camera.addComponent(new WorldSoundListenerComponent(scene.soundEngine))
        camera.addComponent(new WorldDrawerComponent(scene.canvas))

        world.appendChild(camera)

        setState((state) => ({
            ...state,
            world: world,
            camera: camera,
            remoteControlsManager: remoteControlsManager
        }))

        return () => {
            scene.setTitle(undefined)
            scene.loop.stop()
            camera.removeFromParent()
            props.client.connection.close()
        }
    }, [])

    useEffect(() => {
        let onError = () => {
            props.onError(new BasicMessageLoadingError({
                header: "Соединение потеряно",
                description: "Что-то не так с интернетом?"
            }).withGoBackAction().withRetryAction(() => window.location.reload()))
        }
        let onClose = () => {
            props.onError(new BasicMessageLoadingError({
                header: "Соединение закрыто",
                description: "Возможно, игровая комната была закрыта или сервер ушел спать."
            }).withGoBackAction().withRetryAction(() => window.location.reload()))
        }
        props.client.connection.on("error", onError)
        props.client.connection.on("close", onClose)
        return () => {
            props.client.connection.off("error", onError)
            props.client.connection.off("close", onClose)
        }
    }, [props.client, props.onError])

    useEffect(() => {
        let texture = Sprite.applyTexture(scene.canvas.ctx)
        return () => Sprite.cleanupTexture(scene.canvas.ctx, texture)
    }, [])

    useEffect(() => {
        scene.loop.on("tick", onDraw)
        return () => scene.loop.off("tick", onDraw)
    }, [onDraw])

    const updateIntervalIndexRef = useRef<number | null>(null)

    useEffect(() => {
        if(!state.remoteControlsManager) return undefined
        const update = () => {
            state.remoteControlsManager.updateIfNeeded()
            updateIntervalIndexRef.current = scene.loop.scheduleTask(update, controlsUpdateInterval)
        }
        update()
        return () => scene.loop.clearScheduledTask(updateIntervalIndexRef.current)
    }, [state.remoteControlsManager])

    useEffect(() => {
        if(!state.world) return undefined
        const onEventView = (message: React.FC, props: any) => {
            eventContextRef.current?.addEvent(message, props)
        }
        const onChooseTank = () => {
            tankSelectRef.current?.show()
        }
        state.world.on("choose-tank", onChooseTank)
        state.world.on("event-view", onEventView)

        return () => {
            state.world.off("choose-tank", onChooseTank)
            state.world.off("event-view", onEventView)
        }
    }, [state.world, eventContextRef.current])

    useEffect(() => {
        state.world?.getComponent(GameHudListenerComponent).setHud(gameHudRef.current)
        return () => state.world?.getComponent(GameHudListenerComponent).setHud(null)
    }, [gameHudRef.current])

    useEffect(() => {
        if(props.client.connection.isSuspended()) {
            props.client.connection.resume()
        }
    }, [])

    return (
        <ControlsProvider ref={controlsResponderRef}>
            <EventsProvider ref={eventContextRef}>
                <PlayerNicksHUD world={state.world} screen={scene.canvas} camera={state.camera} />
                <TankInfoHUD world={state.world} />
                <EventsHUD/>
                <PlayerListHUD world={state.world}/>
                <GameHUD keyedComponentsRef={gameHudRef}/>
                <TankSelectOverlay ref={tankSelectRef} onTankSelect={onTankSelected}/>
                <PauseOverlay rootComponent={<GamePauseView/>}/>
            </EventsProvider>
        </ControlsProvider>
    )
}

const GameScene: React.FC = () => {
    const connectionPrerequisite = useMemo(() => new SocketConnectionPrerequisite(), [])
    const [gameError, setGameError] = useState<LoadingError | null>(null)

    const prerequisites = usePrerequisites(() => [
        new TexturesResourcePrerequisite(),
        new SoundResourcePrerequisite(),
        connectionPrerequisite,
    ])
    
    const onError = useCallback((error: any) => {
        setGameError(convertErrorToLoadingError(error))
    }, [])
    
    if(prerequisites.loaded && !gameError) {
        return <GameView client={connectionPrerequisite.client} onError={onError}/>
    } else {
        return <LoadingScene progress={prerequisites.progress} error={prerequisites.error ?? gameError}/>
    }
}

SceneController.shared.registerScene("game", GameScene)