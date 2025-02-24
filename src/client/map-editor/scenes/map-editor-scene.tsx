import WorldDrawerComponent from '../../entity/components/world-drawer-component';
import CameraComponent from 'src/client/graphics/camera';
import MapEditorBackgroundOverlay from 'src/client/controls/interact/map-editor-background-overlay';
import ToolManager from '../tools/toolmanager';
import Tools from "../tools/type-loader"
import GameMapHistoryComponent from "../history/game-map-history-component";
import RootControlsResponder, {ControlsResponder} from "src/client/controls/root-controls-responder";
import Entity from "src/utils/ecs/entity";
import {clientGameWorldEntityPrefab} from "src/client/entity/client-game-world-entity-prefab";
import WorldSoundListenerComponent from "src/client/entity/components/sound/world-sound-listener-component";
import PauseOverlay from "src/client/ui/pause-overlay/pause-overlay";
import CameraPositionController from "src/entity/components/camera-position-controller";
import TransformComponent from "src/entity/components/transform-component";
import MapEditorPauseView from '../ui/pause/map-editor-pause';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import SceneController, { useScene } from 'src/client/scenes/scene-controller';
import { BasicSceneDescriptor } from 'src/client/scenes/scene-descriptor';
import ToolBarView from 'src/client/map-editor/ui/workspace-overlay/toolbar/toolbar';
import Tool from '../tools/tool';
import BrickBlockState from 'src/map/block-state/types/brick-block-state';
import ToolSettingsView from '../ui/workspace-overlay/tool-settings/tool-settings-view';
import EventsHUD, { EventsProvider } from 'src/client/ui/events-hud/events-hud';
import { BasicEvent } from 'src/client/ui/events-hud/basic-event-view';
import { KeyedComponentsHandle } from 'src/client/utils/keyed-component';
import WorldTilemapComponent from 'src/physics/world-tilemap-component';
import { MapFile, readMapFile } from 'src/map/map-serialization';
import TilemapComponent from '../../../map/tilemap-component';
import ClientEntityPrefabs from 'src/client/entity/client-entity-prefabs';
import { EntityType } from 'src/entity/entity-type';
import GameMapNameComponent from '../map-name-component';
import SpawnzonesComponent from 'src/map/spawnzones-component';
import { convertErrorToLoadingError, LoadingError } from 'src/client/scenes/loading/loading-error';
import { Progress } from 'src/client/utils/progress';
import { ScenePrerequisite, TexturesResourcePrerequisite, usePrerequisites } from 'src/client/scenes/scene-prerequisite';
import LoadingScene from 'src/client/scenes/loading/loading-scene';
import Sprite from 'src/client/graphics/sprite';
import { ControlsProvider } from 'src/client/utils/react-controls-responder';

interface MapEditorSceneContextProps {
    loadMap: (map: MapFile) => void   
}

const MapEditorSceneContext = createContext<MapEditorSceneContextProps | undefined>(undefined);

export const useMapEditorScene = (): MapEditorSceneContextProps => {
    const context = useContext(MapEditorSceneContext);
    if (!context) {
        throw new Error('useMapEditorScene must be used within a MapEditorScene');
    }
    return context;
};

const MapEditorView: React.FC = () => {
    const scene = useScene()
    const eventRef = useRef<KeyedComponentsHandle | null>(null)

    const [state, setState] = React.useState({
        controlsResponder: null as ControlsResponder | null,
        camera: null as Entity | null,
        world: null as Entity | null,
        toolManager: null as ToolManager | null,
        toolList: [] as Tool[],
    })

    const stateRef = useRef(state)
    const needsRedrawRef = useRef(true)
    const controlsResponderRef = useRef<ControlsResponder | null>(null)

    useEffect(() => { stateRef.current = state }, [state])

    const onDraw = (dt: number) => {
        RootControlsResponder.getInstance().refresh()
        if(!needsRedrawRef.current) return
        state.world?.emit("tick", dt)
        state.world?.emit("draw")
        state.camera?.getComponent(CameraPositionController)
            .setViewport({ x: scene.canvas.width, y: scene.canvas.height })
    }

    const setNeedsRedraw = () => {
        needsRedrawRef.current = true
    }

    useEffect(() => {
        scene.setTitle("Танчики - Редактор карт")
        scene.canvas.clear()

        const world = new Entity()
        const camera = new Entity()
        const toolManager = new ToolManager(world)

        const toolList = Tools.map(Tool => new Tool(toolManager))
        
        clientGameWorldEntityPrefab(world)
        world.addComponent(new WorldTilemapComponent())

        toolManager.selectBlock(new BrickBlockState())

        toolManager.on("redraw", () => {
            setNeedsRedraw()
        })

        controlsResponderRef.current.on("game-toggle-debug", () => {
            camera.getComponent(WorldDrawerComponent).toggleDebugDraw()
        })

        controlsResponderRef.current.on("editor-undo", (event) => {
            const map = world.getComponent(WorldTilemapComponent).map
            const history = map.getComponent(GameMapHistoryComponent)
            let entry = history?.goBack()

            eventRef.current.addEvent?.(() => (
                <BasicEvent text={entry ? "Отменено: " + entry.actionName : "Нечего отменять"}/>
            ))
        })

        controlsResponderRef.current.on("editor-redo", (event) => {
            const map = world.getComponent(WorldTilemapComponent).map
            const history = map.getComponent(GameMapHistoryComponent)
            let entry = history?.goForward()

            eventRef.current.addEvent?.(() => (
                <BasicEvent text={entry ? "Повторено: " + entry.actionName : "Нечего повторять"}/>
            ))
        })

        camera.addComponent(new TransformComponent())
        camera.addComponent(new CameraComponent())
        camera.addComponent(new CameraPositionController()
            .setBaseScale(12)
            .setViewport({ x: screen.width, y: screen.height }))
        camera.addComponent(new WorldSoundListenerComponent(scene.soundEngine))
        camera.addComponent(new WorldDrawerComponent(scene.canvas))

        world.appendChild(camera)

        setState((state) => ({
            ...state,
            world: world,
            camera: camera,
            toolManager: toolManager,
            toolList: toolList
        }))

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
        scene.loop.run = onDraw
        return () => scene.loop.run = null
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
        const state = stateRef.current
        const map = state.world.getComponent(WorldTilemapComponent).map
        map?.removeFromParent()

        const { width, height, blocks, spawnZones, name } = readMapFile(mapFile)

        const entity = new Entity()
        ClientEntityPrefabs.types.get(EntityType.TILEMAP)(entity)
        entity.addComponent(new GameMapHistoryComponent())
        entity.addComponent(new GameMapNameComponent(name))
        entity.addComponent(new SpawnzonesComponent(spawnZones))
        entity.getComponent(TilemapComponent).setMap(width, height, blocks)

        state.world.appendChild(entity)
        state.world.getComponent(WorldTilemapComponent).map = entity

        let target = {
            x: width * TilemapComponent.BLOCK_SIZE / 2,
            y: height * TilemapComponent.BLOCK_SIZE / 2
        }
        state.camera.getComponent(CameraPositionController).setTarget(target).reset()
        state.camera.getComponent(CameraPositionController).onTick(0)
        setNeedsRedraw()
    }, [])

    return (
        <ControlsProvider ref={controlsResponderRef}>
            <MapEditorSceneContext.Provider value={{loadMap}}>
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
                    <EventsHUD/>
                    <PauseOverlay rootComponent={<MapEditorPauseView/>} gameControls={state.controlsResponder}/>
                </EventsProvider>
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
