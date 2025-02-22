
import { getTutorialMap } from "src/client/tutorial/tutorial-map";
import EmbeddedServerGame from "src/client/embedded-server/embedded-server-game";
import TutorialWorldController from "src/client/tutorial/tutorial-world-controller";
import WorldCommunicationPacket from "src/networking/packets/game-packets/world-communication-packet";
import ReadBuffer from "src/serialization/binary/read-buffer";
import EntityDataReceiveComponent from "src/entity/components/network/receiving/entity-data-receive-component";
import RemoteControlsManager from "src/client/controls/remote-controls-manager";
import SceneController, { useScene } from "../scenes/scene-controller";
import { BasicSceneDescriptor } from "../scenes/scene-descriptor";
import { soundResourcePrerequisite, texturesResourcePrerequisite } from "../scenes/scene-prerequisite";
import Entity from "src/utils/ecs/entity";
import TransformComponent from "src/entity/components/transform-component";
import CameraComponent from "../graphics/camera";
import WorldDrawerComponent from "../entity/components/world-drawer-component";
import CameraPositionController from "src/entity/components/camera-position-controller";
import WorldSoundListenerComponent from "../entity/components/sound/world-sound-listener-component";
import RootControlsResponder, { ControlsResponder } from "../controls/root-controls-responder";
import PlayerChatPacket from "src/networking/packets/game-packets/player-chat-packet";
import PlayerTankSelectPacket from "src/networking/packets/game-packets/player-tank-select-packet";
import ChatHUD from "../ui/chat-hud/chat-hud";
import TankInfoHUD from "../ui/tank-info-hud/tank-info-hud";
import PlayerNicksHUD from "../ui/player-nicks-hud/player-nicks-hud";
import GamePauseView from "../game/game-pause-view";
import PauseOverlay from "../ui/pause-overlay/pause-overlay";
import CameraPrimaryEntityController from "src/entity/components/camera-primary-entity-watcher";
import PrimaryEntityControls from "src/entity/components/primary-entity-controls";
import React, { useCallback, useEffect, useRef } from "react"
import EventsHUD, {  EventsProvider } from "../ui/events-hud/events-hud";
import { KeyedComponentsHandle } from "../utils/keyed-component";

const TutorialScene: React.FC = () => {
    const scene = useScene()

    const [state, setState] = React.useState({
        controlsResponder: null as ControlsResponder | null,
        camera: null as Entity | null,
        remoteControlsManager: null as RemoteControlsManager | null,
        game: null as EmbeddedServerGame | null,
        messageCount: 0
    })

    const eventContextRef = useRef<KeyedComponentsHandle | null>(null)
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
        state.remoteControlsManager?.updateIfNeeded()
        state.game?.tick(dt)
        state.game?.clientWorld.emit("draw")
        state.camera?.getComponent(CameraPositionController)
            .setViewport({ x: scene.canvas.width, y: scene.canvas.height })
    }

    const onChat = (text: string) => {
        new PlayerChatPacket(text).sendTo(state.game.clientConnection.connection)
    }

    const onTankSelected = (tank: number) => {
        new PlayerTankSelectPacket(tank).sendTo(state.game.clientConnection.connection)
    }

    useEffect(() => {
        scene.setTitle("Танчики - Туториал")
        scene.loop.start()
        scene.canvas.clear()

        const controlsResponder = new ControlsResponder()
        const game = new EmbeddedServerGame({})
        const worldController = new TutorialWorldController(game.serverGame)
        const remoteControlsManager = new RemoteControlsManager(controlsResponder, game.clientConnection.connection)
        
        game.clientConnection.on(WorldCommunicationPacket, (packet) => {
            let buffer = new ReadBuffer(packet.buffer.buffer)
            game.clientWorld.getComponent(EntityDataReceiveComponent).receiveBuffer(buffer)
        })

        game.clientConnection.on(PlayerChatPacket, (packet) => addMessage(packet.text))

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

        game.clientWorld.addComponent(new PrimaryEntityControls(controlsResponder))
        game.clientWorld.appendChild(camera)
        game.connectClientToServer()

        setState((state) => ({
            ...state,
            camera: camera,
            game: game,
            remoteControlsManager: remoteControlsManager,
            controlsResponder: controlsResponder,
        }))

        RootControlsResponder.getInstance().setMainResponderDelayed(controlsResponder)

        return () => {
            scene.setTitle(undefined)
            scene.loop.stop()
            camera.removeFromParent()

            RootControlsResponder.getInstance().setMainResponderDelayed(null)
        }
    }, [])

    useEffect(() => {
        scene.loop.run = onDraw
        return () => scene.loop.run = null
    }, [onDraw])

    useEffect(() => {
        if(!state.game?.clientWorld) return undefined
        const onUserMessage = (message: React.FC, props: any) => {
            eventContextRef.current?.addEvent(message, props)
        }
        state.game.clientWorld.on("event-view", onUserMessage)
        return () => state.game.clientWorld.off("event-view", onUserMessage)
    }, [state.game, eventContextRef.current])

    return (
        <EventsProvider ref={eventContextRef}>
            <PlayerNicksHUD world={state.game?.clientWorld} screen={scene.canvas} camera={state.camera?.getComponent(CameraComponent)} />
            <TankInfoHUD world={state.game?.clientWorld} />
            <ChatHUD gameControls={state.controlsResponder} onChat={onChat} messageCount={state.messageCount} getMessage={getMessage}/>
            <EventsHUD/>
            <PauseOverlay rootComponent={<GamePauseView/>} gameControls={state.controlsResponder}/>
        </EventsProvider>
    )
}

SceneController.shared.registerScene("tutorial", () => new BasicSceneDescriptor([
    soundResourcePrerequisite,
    texturesResourcePrerequisite
], () => <TutorialScene />));