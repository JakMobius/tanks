import WorldDrawerComponent from '../entity/components/world-drawer-component';
import CameraComponent from 'src/client/graphics/camera';
import MapEditorBackgroundOverlay from 'src/client/controls/interact/map-editor-background-overlay';
import RootControlsResponder, {ControlsResponder} from "src/client/controls/root-controls-responder";
import Entity from "src/utils/ecs/entity";
import WorldSoundListenerComponent from "src/client/entity/components/sound/world-sound-listener-component";
import PauseOverlay from "src/client/ui/pause-overlay/pause-overlay";
import CameraPositionController from "src/entity/components/camera-position-controller";
import TransformComponent from "src/entity/components/transform/transform-component";
import MapEditorPauseView from './map-editor-pause';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import SceneController, { useScene } from 'src/client/scenes/scene-controller';
import Tool from './tools/tool';
import EventsHUD, { EventsProvider } from 'src/client/ui/events-hud/events-hud';
import { KeyedComponentsHandle } from 'src/client/utils/keyed-component';
import { TexturesResourcePrerequisite, usePrerequisites } from 'src/client/scenes/scene-prerequisite';
import LoadingScene from 'src/client/scenes/loading/loading-scene';
import Sprite from 'src/client/graphics/sprite';
import { ControlsProvider } from 'src/client/utils/react-controls-responder';
import MapEditorSidebar from '../ui/map-editor-sidebar/map-editor-sidebar';
import { useDragLayer } from 'react-dnd';
import EmbeddedServerGame from '../embedded-server/embedded-server-game';
import WorldDataPacket from 'src/networking/packets/game-packets/world-data-packet';
import EntityDataReceiveComponent from 'src/entity/components/network/receiving/entity-data-receive-component';
import WriteBuffer from 'src/serialization/binary/write-buffer';
import PlayerPrefab from "src/entity/types/player/server-prefab";
import PlayerWorldComponent from 'src/entity/types/player/server-side/player-world-component';
import { writeEntityFile } from 'src/map/map-serialization';
import { downloadFile } from 'src/utils/html5-download';
import { FileDropOverlay } from '../ui/file-drop-overlay/file-drop-overlay';
import GroupPrefab from 'src/entity/types/group/server-prefab';
import PlayerConnectionManagerComponent from 'src/entity/types/player/server-side/player-connection-manager-component';

interface MapEditorSceneContextProps {
    currentSelectedEntity: Entity | null 
    rootEntity: Entity,
    mapName: string | null,
    selectEntity: (entity: Entity) => void
    update: () => void
    loadMap: (name: string, entity: Entity) => void
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
        const rootGroup = new Entity()
        GroupPrefab.prefab(rootGroup)
        game.serverGame.appendChild(rootGroup)

        game.clientConnection.on(WorldDataPacket, (packet) => {
            game.clientWorld.getComponent(EntityDataReceiveComponent).receivePacket(packet)
        })

        game.clientWorld.on("response", (buffer: WriteBuffer) => {
            new WorldDataPacket(buffer.buffer).sendTo(game.clientConnection.connection)
        })

        game.serverGame.on("client-connect", (client) => {
            const player = new Entity()

            PlayerPrefab.prefab(player)
            player.getComponent(PlayerConnectionManagerComponent).setClient(client)
            player.getComponent(PlayerWorldComponent).connectToWorld(game.serverGame)
        })

        const world = game.clientWorld

        controlsResponderRef.current.on("editor-save-maps", () => {
            setSceneContext(sceneContext => {
                let name = sceneContext.mapName ?? "Новая карта"
                downloadFile(name + ".json", writeEntityFile(sceneContext.rootEntity, sceneContext.mapName))
                return sceneContext
            })
        })

        const camera = new Entity()
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
        }))

        setSceneContext((context) => ({
            ...context,
            rootEntity: rootGroup,
            mapName: "Новая карта",
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
    }, [state.camera])

    const loadMap = useCallback((name: string, entity: Entity) => {
        setSceneContext((context) => {
            let parent = context.rootEntity.parent
            context.rootEntity.removeFromParent()
            parent.appendChild(entity)
            return {
                ...context,
                currentSelectedEntity: null,
                rootEntity: entity,
                mapName: name
            }
        })
        setNeedsRedraw()
    }, [])

    const [sceneContext, setSceneContext] = useState<MapEditorSceneContextProps>({
        currentSelectedEntity: null,
        rootEntity: null,
        mapName: null,
        update: setNeedsRedraw,
        loadMap,
        selectEntity: (entity) => {
            setSceneContext((context) => ({
                ...context,
                currentSelectedEntity: entity
            }))
        }
    })

    return (
        <ControlsProvider ref={controlsResponderRef}>
            <MapEditorSceneContext.Provider value={sceneContext}>
                <EventsProvider ref={eventRef}>
                    <MapEditorBackgroundOverlay
                        draggingEnabled={false}
                        camera={state.camera}
                        onDrag={onDrag}
                        onZoom={onZoom}
                        // onMouseDown={onMouseDown}
                        // onMouseUp={onMouseUp}
                        // onMouseMove={onMouseMove}
                    />
                    <MapEditorSidebar/>
                    <EventsHUD/>
                    <PauseOverlay rootComponent={<MapEditorPauseView/>}/>
                    <FileDropOverlay/>
                </EventsProvider>
                <DragPreviewContainer/>
            </MapEditorSceneContext.Provider>
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
