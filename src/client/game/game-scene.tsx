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
import React, { useEffect, useRef } from 'react';
import RootControlsResponder, { ControlsResponder } from '../controls/root-controls-responder';
import TransformComponent from 'src/entity/components/transform-component';
import CameraComponent from '../graphics/camera';
import CameraPositionController from 'src/entity/components/camera-position-controller';
import CameraPrimaryEntityController from 'src/entity/components/camera-primary-entity-watcher';
import WorldSoundListenerComponent from '../entity/components/sound/world-sound-listener-component';
import WorldDrawerComponent from '../entity/components/world-drawer-component';
import PlayerNickOverlay from '../ui/overlay/player-nick-overlay/player-nicks-view';
import TankInfoView from '../ui/overlay/tank-info-overlay/tank-info-overlay';
import ChatView from '../ui/overlay/chat-overlay/chat-container';
import PauseOverlay from '../ui/overlay/pause-overlay/pause-overlay';
import GamePauseView from './game-pause-view';
import { SceneDescriptor } from '../scenes/scene-descriptor';
import { ScenePrerequisite, soundResourcePrerequisite, texturesResourcePrerequisite } from '../scenes/scene-prerequisite';
import { Progress, ProgressLeaf } from '../utils/progress';
import PageLocation from '../scenes/page-location';
import { RandomMessageLoadingError } from '../scenes/loading/loading-error';
import { internetErrorMessageGenerator, missingRoomNameErrorMessageGenerator } from '../scenes/loading/error-message-generator';
import WebsocketConnection from '../networking/websocket-connection';
import PrimaryEntityControls from 'src/entity/components/primary-entity-controls';
import TankSelectView from '../ui/overlay/tank-select-overlay/tank-select-view';
import PlayerListView from '../ui/overlay/player-list-overlay/player-list-view';

export interface GameSceneConfig {
    client: ConnectionClient
}

const GameScene: React.FC<GameSceneConfig> = (props) => {
    const controlsUpdateInterval = 0.05

    const scene = useScene()

    const [state, setState] = React.useState({
        controlsResponder: null as ControlsResponder | null,
        camera: null as Entity | null,
        world: null as Entity | null,
        remoteControlsManager: null as RemoteControlsManager | null
    })

    const onDraw = (dt: number) => {
        RootControlsResponder.getInstance().refresh()
        state.world?.emit("tick", dt)
        state.world?.emit("draw")
        state.camera?.getComponent(CameraPositionController)
            .setViewport({ x: scene.canvas.width, y: scene.canvas.height })
    }

    const onChat = (text: string) => {
        new PlayerChatPacket(text).sendTo(props.client.connection)
    }

    const onTankSelected = (tank: number) => {
        new PlayerTankSelectPacket(tank).sendTo(props.client.connection)
    }

    useEffect(() => {
        scene.setTitle("Танчики")
        scene.loop.start()

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

        props.client.on(PlayerChatPacket, (packet) => {
            // this.chatContainer.addMessage(packet.text)
        })

        props.client.on(WorldCommunicationPacket, (packet) => {
            let buffer = new ReadBuffer(packet.buffer.buffer)
            world.getComponent(EntityDataReceiveComponent).receiveBuffer(buffer)
        })

        camera.addComponent(new TransformComponent())
        camera.addComponent(new CameraComponent())
        camera.addComponent(new CameraPositionController()
            .setBaseScale(12)
            .setViewport({ x: screen.width, y: screen.height }))
        camera.addComponent(new CameraPrimaryEntityController().setWorld(world))
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

    return <>
        <PlayerNickOverlay world={state.world} screen={scene.canvas} camera={state.camera?.getComponent(CameraComponent)} />
        <TankInfoView world={state.world} />
        <ChatView />
        <PlayerListView/>
        <TankSelectView onTankSelect={onTankSelected} gameControls={state.controlsResponder}/>
        <PauseOverlay rootComponent={<GamePauseView/>} gameControls={state.controlsResponder}/>
    </>
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