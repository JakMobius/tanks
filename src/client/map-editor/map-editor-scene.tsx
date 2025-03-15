import WorldDrawerComponent from '../entity/components/world-drawer-component';
import CameraComponent from 'src/client/graphics/camera';
import RootControlsResponder, {ControlsResponder} from "src/client/controls/root-controls-responder";
import Entity from "src/utils/ecs/entity";
import WorldSoundListenerComponent from "src/client/entity/components/sound/world-sound-listener-component";
import PauseOverlay from "src/client/ui/pause-overlay/pause-overlay";
import CameraPositionController from "src/entity/components/camera-position-controller";
import TransformComponent from "src/entity/components/transform/transform-component";
import MapEditorPauseView from './map-editor-pause';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import SceneController, { useScene } from 'src/client/scenes/scene-controller';
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
import { mapEditorEntityFactory } from './editor-entity-factory';
import { EntityEditorTreeRootComponent } from '../ui/scene-tree-view/components';
import ToolBarView, { ToolBarRef } from '../ui/toolbar/toolbar';
import { MapEditorMouseHandler } from '../controls/interact/map-editor-mouse-handler';

interface MapEditorSceneContextProps {
    clientCameraEntity: Entity,
    game: EmbeddedServerGame,
    selectedServerEntity: Entity | null 
    serverMapEntity: Entity,
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
    const needsRedrawRef = useRef(true)
    const toolBarRef = useRef<ToolBarRef>(null)
    const controlsResponderRef = useRef<ControlsResponder | null>(null)

    const setNeedsRedraw = () => {
        needsRedrawRef.current = true
    }

    const loadMap = useCallback((name: string, entity: Entity) => {
        setSceneContext((context) => {
            let parent = context.serverMapEntity.parent
            context.serverMapEntity.removeFromParent()
            parent.appendChild(entity)
            return {
                ...context,
                serverMapEntity: entity,
                selectedServerEntity: null,
                mapName: name,
            }
        })
        setNeedsRedraw()
    }, [])

    const selectEntity = useCallback((entity: Entity) => {            
        setSceneContext((context) => {
            context.selectedServerEntity?.emit("editor-blur")
            entity?.emit("editor-focus")
            return {
                ...context,
                selectedServerEntity: entity
            }
        })
        setNeedsRedraw()
    }, [])

    const initialState = useMemo(() => {
        const rootGroup = new Entity()
        GroupPrefab.prefab(rootGroup)

        const game = new EmbeddedServerGame()
        game.clientWorld.getComponent(EntityDataReceiveComponent).makeRoot(mapEditorEntityFactory)
        game.serverGame.addComponent(new EntityEditorTreeRootComponent())
        game.serverGame.appendChild(rootGroup)

        game.clientConnection.on(WorldDataPacket, (packet) => {
            game.clientWorld.getComponent(EntityDataReceiveComponent).receivePacket(packet)
        })

        game.clientWorld.on("response", (buffer: WriteBuffer) => {
            new WorldDataPacket(buffer.buffer).sendTo(game.clientConnection.connection)
        })

        game.serverGame.on("request-focus", (entity) => {
            selectEntity(entity)
        })

        game.serverGame.on("client-connect", (client) => {
            const player = new Entity()

            PlayerPrefab.prefab(player)
            player.getComponent(PlayerConnectionManagerComponent).setClient(client)
            player.getComponent(PlayerWorldComponent).connectToWorld(game.serverGame)
        })

        const camera = new Entity()
        camera.addComponent(new TransformComponent())
        camera.addComponent(new CameraComponent()
            .setViewport({ x: screen.width, y: screen.height }))
        camera.addComponent(new CameraPositionController()
            .setBaseScale(12)
            .setTarget({ x: 0, y: 0 }))
        camera.addComponent(new WorldSoundListenerComponent(scene.soundEngine))
        camera.addComponent(new WorldDrawerComponent(scene.canvas))

        game.clientWorld.appendChild(camera)
        game.connectClientToServer()

        return {
            clientCameraEntity: camera,
            game,
            selectedServerEntity: null,
            serverMapEntity: rootGroup,
            mapName: "Новая карта",
            update: setNeedsRedraw,
            loadMap,
            selectEntity: selectEntity
        } as MapEditorSceneContextProps
    }, [])

    const [sceneContext, setSceneContext] = useState<MapEditorSceneContextProps>(initialState)
    const contextRef = useRef(sceneContext)
    useEffect(() => { contextRef.current = sceneContext }, [sceneContext])

    const onDraw = useCallback((dt: number) => {
        RootControlsResponder.getInstance().refresh()
        let needsRedraw = sceneContext.game?.serverLoop.runScheduledTasks(dt)

        if(!needsRedrawRef.current && !needsRedraw && !scene.canvas.needsResize) return
        needsRedrawRef.current = false
        
        sceneContext.clientCameraEntity?.getComponent(CameraComponent)
            .setViewport({ x: scene.canvas.width, y: scene.canvas.height })
        sceneContext.game?.serverLoop.emit("tick", dt)
        sceneContext.game?.clientWorld.emit("tick", dt)
        sceneContext.game?.clientWorld.emit("draw")
    }, [])

    useEffect(() => {
        scene.setTitle("Танчики - Редактор карт")
        scene.canvas.clear()
        scene.loop.start()

        let texture = Sprite.applyTexture(scene.canvas.ctx)

        controlsResponderRef.current.on("editor-save-maps", () => {
            setSceneContext(sceneContext => {
                let name = sceneContext.mapName ?? "Новая карта"
                downloadFile(name + ".json", writeEntityFile(sceneContext.serverMapEntity, sceneContext.mapName))
                return sceneContext
            })
        })
        
        return () => {
            Sprite.cleanupTexture(scene.canvas.ctx, texture)
            
            scene.setTitle(undefined)
            scene.loop.stop()
            contextRef.current.clientCameraEntity.removeFromParent()
        }
    }, [])

    useEffect(() => {
        scene.loop.on("tick", onDraw)
        return () => scene.loop.off("tick", onDraw)
    }, [])

    const onDrag = useCallback((dx: number, dy: number) => {
        toolBarRef.current?.toolManager.selectedTool?.onDrag(dx, dy)
    }, [])

    const onZoom = useCallback((zoom: number, x: number, y: number) => {
        toolBarRef.current?.toolManager.selectedTool?.onZoom(zoom, x, y)
    }, [])

    const onMouseDown = useCallback((x: number, y: number) => {
        toolBarRef.current?.toolManager.selectedTool?.onMouseDown(x, y)
    }, [])

    const onMouseUp = useCallback((x: number, y: number) => {
        toolBarRef.current?.toolManager.selectedTool?.onMouseUp(x, y)
    }, [])

    const onMouseMove = useCallback((x: number, y: number) => {
        toolBarRef.current?.toolManager.selectedTool?.onMouseMove(x, y)
    }, [])

    return (
        <ControlsProvider ref={controlsResponderRef}>
            <MapEditorSceneContext.Provider value={sceneContext}>
                <EventsProvider ref={eventRef}>
                    <MapEditorMouseHandler
                        camera={sceneContext.clientCameraEntity}
                        onDrag={onDrag}
                        onZoom={onZoom}
                        onMouseDown={onMouseDown}
                        onMouseUp={onMouseUp}
                        onMouseMove={onMouseMove}
                    />
                    <MapEditorSidebar/>
                    <ToolBarView ref={toolBarRef}/>
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
