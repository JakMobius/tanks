import PlayerChatPacket from 'src/networking/packets/game-packets/player-chat-packet';
import ConnectionClient from "src/networking/connection-client";
import WorldCommunicationPacket from "src/networking/packets/game-packets/world-communication-packet";
import EntityDataReceiveComponent from "src/entity/components/network/receiving/entity-data-receive-component";
import ReadBuffer from "src/serialization/binary/read-buffer";
import Entity from "src/utils/ecs/entity";
import {clientGameWorldEntityPrefab} from "src/client/entity/client-game-world-entity-prefab";
import PlayerTankSelectPacket from "src/networking/packets/game-packets/player-tank-select-packet";
import RemoteControlsManager from "src/client/controls/remote-controls-manager";
import SceneController, { useScene } from '../scenes/scene-controller';
import React, { useCallback, useEffect, useRef } from 'react';
import RootControlsResponder, { ControlsResponder } from '../controls/root-controls-responder';
import TransformComponent from 'src/entity/components/transform-component';
import CameraComponent from '../graphics/camera';
import CameraPositionController from 'src/entity/components/camera-position-controller';
import CameraPrimaryEntityController from 'src/entity/components/camera-primary-entity-watcher';
import WorldSoundListenerComponent from '../entity/components/sound/world-sound-listener-component';
import WorldDrawerComponent from '../entity/components/world-drawer-component';
import PlayerNicksHUD from '../ui/player-nicks-hud/player-nicks-hud';
import TankInfoHUD from '../ui/tank-info-hud/tank-info-hud';
import ChatHUD from '../ui/chat-hud/chat-hud';
import PauseOverlay from '../ui/pause-overlay/pause-overlay';
import GamePauseView from './game-pause-view';
import { SceneDescriptor } from '../scenes/scene-descriptor';
import { ScenePrerequisite, soundResourcePrerequisite, texturesResourcePrerequisite } from '../scenes/scene-prerequisite';
import { Progress, ProgressLeaf } from '../utils/progress';
import PageLocation from '../scenes/page-location';
import { RandomMessageLoadingError } from '../scenes/loading/loading-error';
import { internetErrorMessageGenerator, missingRoomNameErrorMessageGenerator } from '../scenes/loading/error-message-generator';
import WebsocketConnection from '../networking/websocket-connection';
import PrimaryEntityControls from 'src/entity/components/primary-entity-controls';
import TankSelectOverlay, { TankSelectOverlayHandle } from '../ui/tank-select-overlay/tank-select-overlay';
import PlayerListHUD from '../ui/player-list-hud/player-list-hud';
import EventsHUD, { EventsProvider } from '../ui/events-hud/events-hud';
import GameHUD from '../ui/game-hud/game-hud';
import { KeyedComponentsHandle } from '../utils/keyed-component';

export interface GameSceneConfig {
    client: ConnectionClient
}

const GameScene: React.FC<GameSceneConfig> = (props) => {
    const controlsUpdateInterval = 0.05

    const scene = useScene()
    const eventContextRef = useRef<KeyedComponentsHandle | null>(null)
    const gameHudRef = useRef<KeyedComponentsHandle | null>(null)
    const tankSelectRef = useRef<TankSelectOverlayHandle | null>(null)

    const [state, setState] = React.useState({
        controlsResponder: null as ControlsResponder | null,
        camera: null as Entity | null,
        world: null as Entity | null,
        remoteControlsManager: null as RemoteControlsManager | null,
        messageCount: 0
    })

    const messagesRef = useRef<string[]>([])

    const addMessage = (message: string) => {
        messagesRef.current.push(message)
        setState((state) => ({
            ...state,
            messageCount: messagesRef.current.length,
        }))
    }

    const getMessage = useCallback((index: number) => {
        return messagesRef.current[index]
    }, [])

    const onDraw = (dt: number) => {
        RootControlsResponder.getInstance().refresh()
        state.world?.emit("tick", dt)
        state.world?.emit("draw")
        state.camera?.getComponent(CameraPositionController)
            .setViewport({ x: scene.canvas.width, y: scene.canvas.height })
    }

    const onChat = useCallback((text: string) => {
        new PlayerChatPacket(text).sendTo(props.client.connection)
    }, [props.client])

    const onTankSelected = useCallback((tank: number) => {
        new PlayerTankSelectPacket(tank).sendTo(props.client.connection)
    }, [props.client])

    useEffect(() => {
        scene.setTitle("Танчики")
        scene.loop.start()
        scene.canvas.clear()

        const controlsResponder = new ControlsResponder()
        const world = new Entity()
        const camera = new Entity()
        const remoteControlsManager = new RemoteControlsManager(controlsResponder, props.client.connection)
        
        clientGameWorldEntityPrefab(world, {})
        world.addComponent(new PrimaryEntityControls(controlsResponder))

        remoteControlsManager.attach()

        controlsResponder.on("game-toggle-debug", () => {
            camera.getComponent(WorldDrawerComponent).toggleDebugDraw()
        })

        props.client.on(PlayerChatPacket, (packet) => addMessage(packet.text))

        props.client.on(WorldCommunicationPacket, (packet) => {
            let buffer = new ReadBuffer(packet.buffer.buffer)
            world.getComponent(EntityDataReceiveComponent).receiveBuffer(buffer)
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
            controlsResponder: controlsResponder,
            remoteControlsManager: remoteControlsManager
        }))

        RootControlsResponder.getInstance().setMainResponderDelayed(controlsResponder)
        props.client.connection.resume()

        return () => {
            scene.setTitle(undefined)
            scene.loop.stop()
            camera.removeFromParent()
            RootControlsResponder.getInstance().setMainResponderDelayed(null)
            props.client.connection.close()
        }
    }, [])

    useEffect(() => {
        scene.loop.run = onDraw
        return () => scene.loop.run = null
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
        const onHudView = (message: React.FC, props: any) => {
            gameHudRef.current?.addEvent(message, props)
        }
        const onChooseTank = () => {
            tankSelectRef.current?.show()
        }
        state.world.on("choose-tank", onChooseTank)
        state.world.on("event-view", onEventView)
        state.world.on("hud-view", onHudView)
        return () => {
            state.world.off("choose-tank", onChooseTank)
            state.world.off("event-view", onEventView)
            state.world.off("hud-view", onHudView)
        }
    }, [state.world, eventContextRef.current])

    return (
        <EventsProvider ref={eventContextRef}>
            <PlayerNicksHUD world={state.world} screen={scene.canvas} camera={state.camera?.getComponent(CameraComponent)} />
            <TankInfoHUD world={state.world} />
            <ChatHUD gameControls={state.controlsResponder} onChat={onChat} messageCount={state.messageCount} getMessage={getMessage}/>
            <EventsHUD/>
            <PlayerListHUD gameControls={state.controlsResponder} world={state.world}/>
            <GameHUD keyedComponentsRef={gameHudRef}/>
            <TankSelectOverlay ref={tankSelectRef} onTankSelect={onTankSelected} gameControls={state.controlsResponder}/>
            <PauseOverlay rootComponent={<GamePauseView/>} gameControls={state.controlsResponder}/>
        </EventsProvider>
    )
}

class SocketConnectionPrerequisite extends ScenePrerequisite {
    client: ConnectionClient | null

    constructor() {
        super();

        this.setLocalizedDescription("Подключение к игровой сессии")
    }

    resolve(): Progress {
        let room = PageLocation.getHashJson().room

        if (!room) {
            return Progress.failed(new RandomMessageLoadingError(missingRoomNameErrorMessageGenerator)
                .withRetryAction(() => window.location.reload())
                .withGoBackAction())
        }

        let progress = new ProgressLeaf()
        let ip = "ws://" + window.location.host + "/game-socket"

        const connection = new WebsocketConnection(ip + "?room=" + room)
        connection.suspend()

        connection.on("ready", () => {
            this.client = new ConnectionClient(connection)
            progress.complete()
        })

        connection.on("error", () => {
            progress.fail(new RandomMessageLoadingError(internetErrorMessageGenerator)
                .withRetryAction(() => window.location.reload())
                .withGoBackAction())
        })

        return progress
    }
}

class GameSceneDescriptor extends SceneDescriptor {

    connectionPrerequisiste = new SocketConnectionPrerequisite()

    constructor() {
        super();

        this.prerequisites = [
            texturesResourcePrerequisite,
            soundResourcePrerequisite,
            this.connectionPrerequisiste
        ]
    }

    createScene(): React.ReactNode {
        return <GameScene client={this.connectionPrerequisiste.client}/>
    }
}

SceneController.shared.registerScene("game", () => new GameSceneDescriptor())