import WorldDrawerComponent from '../entity/components/world-drawer-component';
import CameraComponent from 'src/client/graphics/camera';
import MapEditorBackgroundOverlay from 'src/client/controls/interact/map-editor-background-overlay';
import ToolManager from './tools/toolmanager';
import Tools from "./tools/type-loader"
import RootControlsResponder, {ControlsResponder} from "src/client/controls/root-controls-responder";
import Entity from "src/utils/ecs/entity";
import WorldSoundListenerComponent from "src/client/entity/components/sound/world-sound-listener-component";
import PauseOverlay from "src/client/ui/pause-overlay/pause-overlay";
import CameraPositionController from "src/entity/components/camera-position-controller";
import TransformComponent from "src/entity/components/transform-component";
import MapEditorPauseView from './map-editor-pause';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import SceneController, { useScene } from 'src/client/scenes/scene-controller';
import ToolBarView from 'src/client/ui/toolbar/toolbar';
import Tool from './tools/tool';
import BrickBlockState from 'src/map/block-state/types/brick-block-state';
import ToolSettingsView from '../ui/tool-settings/tool-settings-view';
import EventsHUD, { EventsProvider } from 'src/client/ui/events-hud/events-hud';
import { KeyedComponentsHandle } from 'src/client/utils/keyed-component';
import { MapFile } from 'src/map/map-serialization';
import { TexturesResourcePrerequisite, usePrerequisites } from 'src/client/scenes/scene-prerequisite';
import LoadingScene from 'src/client/scenes/loading/loading-scene';
import Sprite from 'src/client/graphics/sprite';
import { ControlsProvider } from 'src/client/utils/react-controls-responder';
import MapEditorSidebar from '../ui/map-editor-sidebar/map-editor-sidebar';
import { DndProvider, useDragLayer } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import EmbeddedServerGame from '../embedded-server/embedded-server-game';
import WorldDataPacket from 'src/networking/packets/game-packets/world-data-packet';
import ReadBuffer from 'src/serialization/binary/read-buffer';
import EntityDataReceiveComponent from 'src/entity/components/network/receiving/entity-data-receive-component';
import WriteBuffer from 'src/serialization/binary/write-buffer';
import { serverPlayerEntityPrefab } from 'src/entity/types/player/server-side/server-prefab';
import SocketPortalClient from 'src/server/socket/socket-portal-client';
import PlayerWorldComponent from 'src/entity/types/player/server-side/player-world-component';

export default class MapEditorWorldController {
    game: Entity;

    constructor(serverGame: Entity) {
        this.game = serverGame

        this.game.on("client-connect", (client) => this.onClientConnect(client))
    }

    private onClientConnect(client: SocketPortalClient) {

        const player = new Entity()

        serverPlayerEntityPrefab(player, {
            client: client,
            db: null,
            nick: "Вы"
        })

        player.getComponent(PlayerWorldComponent).connectToWorld(this.game)
    }
}

interface MapEditorSceneContextProps {
    loadMap: (map: MapFile) => void  
    currentSelectedEntity: Entity | null 
    game: EmbeddedServerGame,
    selectEntity: (entity: Entity) => void
    update: () => void
}

const MapEditorSceneContext = createContext<MapEditorSceneContextProps | undefined>(undefined);

export const useMapEditorScene = (): MapEditorSceneContextProps => {
    const context = useContext(MapEditorSceneContext);
    if (!context) {
        throw new Error('useMapEditorScene must be used within a MapEditorScene');
    }
    return context;
};

const DragPreviewContainer = () => {
    const { offset, mouse, item } = useDragLayer((m) => {
      return {
        offset: m.getSourceClientOffset(),
        mouse: m.getClientOffset(),
        item: m.getItem(),
        isDragging: m.isDragging(),
      };
    });

    let Preview = item?.preview
    if(!Preview) return <></>
    
    return (
      <Preview
        offset={offset}
        mouse={mouse}
        item={item}
      />
    );
  }

const MapEditorView: React.FC = () => {
    const scene = useScene()
    const eventRef = useRef<KeyedComponentsHandle | null>(null)

    const [state, setState] = React.useState({
        controlsResponder: null as ControlsResponder | null,
        camera: null as Entity | null,
        toolManager: null as ToolManager | null,
        toolList: [] as Tool[],
        game: null as EmbeddedServerGame | null
    })

    const stateRef = useRef(state)
    const needsRedrawRef = useRef(true)
    const controlsResponderRef = useRef<ControlsResponder | null>(null)

    useEffect(() => { stateRef.current = state }, [state])

    const onDraw = (dt: number) => {
        RootControlsResponder.getInstance().refresh()
        let needsRedraw = state.game?.serverLoop.runScheduledTasks(dt)

        if(!needsRedrawRef.current && !needsRedraw && !scene.canvas.needsResize) return
        needsRedrawRef.current = false
        
        state.camera?.getComponent(CameraPositionController)
            .setViewport({ x: scene.canvas.width, y: scene.canvas.height })
        state.game?.serverLoop.emit("tick", dt)
        state.game?.clientWorld.emit("tick", dt)
        state.game?.clientWorld.emit("draw")
    }

    const setNeedsRedraw = () => {
        needsRedrawRef.current = true
    }

    useEffect(() => {
        scene.setTitle("Танчики - Редактор карт")
        scene.canvas.clear()

        const game = new EmbeddedServerGame()

        game.clientConnection.on(WorldDataPacket, (packet) => {
            let buffer = new ReadBuffer(packet.buffer.buffer)
            game.clientWorld.getComponent(EntityDataReceiveComponent).receiveBuffer(buffer)
        })

        game.clientWorld.on("response", (buffer: WriteBuffer) => {
            new WorldDataPacket(buffer.buffer).sendTo(game.clientConnection.connection)
        })

        new MapEditorWorldController(game.serverGame)

        const world = game.clientWorld
        const camera = new Entity()
        const toolManager = new ToolManager(world)

        const toolList = Tools.map(Tool => new Tool(toolManager))

        toolManager.selectBlock(new BrickBlockState())

        toolManager.on("redraw", () => {
            setNeedsRedraw()
        })

        camera.addComponent(new TransformComponent())
        camera.addComponent(new CameraComponent())
        camera.addComponent(new CameraPositionController()
            .setBaseScale(12)
            .setViewport({ x: screen.width, y: screen.height })
            .setTarget({ x: 0, y: 0 }))
        camera.addComponent(new WorldSoundListenerComponent(scene.soundEngine))
        camera.addComponent(new WorldDrawerComponent(scene.canvas))

        world.appendChild(camera)

        setState((state) => ({
            ...state,
            game: game,
            camera: camera,
            toolManager: toolManager,
            toolList: toolList
        }))

        setSceneContext((context) => ({
            ...context,
            game: game
        }))

        game.connectClientToServer()
        scene.loop.start()

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
        scene.canvas
        scene.loop.on("tick", onDraw)
        return () => scene.loop.off("tick", onDraw)
    }, [onDraw])

    const onDrag = useCallback((dx: number, dy: number) => {
        let camera = state.camera.getComponent(CameraPositionController)
        camera.target.x += dx
        camera.target.y += dy
        camera.onTick(0)
        setNeedsRedraw()
    }, [state.camera])

    const onZoom = useCallback((zoom: number) => {
        let camera = stateRef.current.camera.getComponent(CameraPositionController)
        camera.baseScale *= zoom;
        camera.onTick(0)
        setNeedsRedraw()
    }, [])

    const onMouseDown = useCallback((x: number, y: number) => {
        stateRef.current.toolManager?.mouseDown(x, y)
    }, [])

    const onMouseUp = useCallback((x: number, y: number) => {
        stateRef.current.toolManager?.mouseUp(x, y)
    }, [])

    const onMouseMove = useCallback((x: number, y: number) => {
        stateRef.current.toolManager?.mouseMove(x, y)
    }, [])

    const loadMap = useCallback((mapFile: MapFile) => {
        // TODO
    }, [])

    const [sceneContext, setSceneContext] = useState<MapEditorSceneContextProps>({
        loadMap: loadMap,
        currentSelectedEntity: null,
        game: null,
        update: setNeedsRedraw,
        selectEntity: (entity) => {
            setSceneContext((context) => ({
                ...context,
                currentSelectedEntity: entity
            }))
        }
    })

    return (
        <ControlsProvider ref={controlsResponderRef}>
            <DndProvider
                backend={HTML5Backend}
                options={{ rootElement: document.body || undefined }}
                >
                <MapEditorSceneContext.Provider value={sceneContext}>
                    <EventsProvider ref={eventRef}>
                        <MapEditorBackgroundOverlay
                            draggingEnabled={false}
                            matrix={state.camera?.getComponent(CameraComponent).inverseMatrix}
                            onDrag={onDrag}
                            onZoom={onZoom}
                            onMouseDown={onMouseDown}
                            onMouseUp={onMouseUp}
                            onMouseMove={onMouseMove}
                        />
                        <ToolSettingsView toolManager={state.toolManager}/>
                        <ToolBarView
                            toolList={state.toolList}
                            toolManager={state.toolManager}
                        />
                        <MapEditorSidebar/>
                        <EventsHUD/>
                        <PauseOverlay rootComponent={<MapEditorPauseView/>}/>
                    </EventsProvider>
                    <DragPreviewContainer/>
                </MapEditorSceneContext.Provider>
            </DndProvider>
        </ControlsProvider>
    )
}

const MapEditorScene: React.FC = () => {
    const prerequisites = usePrerequisites(() => [
        new TexturesResourcePrerequisite()
    ])

    if(prerequisites.loaded) {
        return <MapEditorView/>
    } else {
        return <LoadingScene progress={prerequisites.progress} error={prerequisites.error}/>
    }
}

SceneController.shared.registerScene("map-editor", MapEditorScene);
