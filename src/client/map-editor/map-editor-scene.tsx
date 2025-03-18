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
import { FileDropOverlay } from '../ui/file-drop-overlay/file-drop-overlay';
import ToolBarView from '../ui/toolbar/toolbar';
import { MapEditorApi } from './map-editor';

const MapEditorSceneContext = createContext<MapEditorApi | undefined>(undefined);

export const useMapEditor = (): MapEditorApi => {
    const context = useContext(MapEditorSceneContext);
    if (!context) {
        throw new Error('useMapEditor must be used within a MapEditorScene');
    }
    return context;
};

const DragPreviewContainer = () => {
    const { offset, mouse, item } = useDragLayer((m) => {
      return {
        offset: m.getSourceClientOffset(),
        mouse: m.getClientOffset(),
        item: m.getItem(),
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
    const controlsResponderRef = useRef<ControlsResponder | null>(null)

    const mapEditor = useMemo(() => {
        const api = new MapEditorApi()

        api.on("redraw", () => needsRedrawRef.current = true)
        api.newMap()

        const camera = new Entity()
        camera.addComponent(new TransformComponent())
        camera.addComponent(new CameraComponent()
            .setViewport({ x: screen.width, y: screen.height }))
        camera.addComponent(new CameraPositionController()
            .setBaseScale(12)
            .setTarget({ x: 0, y: 0 }))
        camera.addComponent(new WorldSoundListenerComponent(scene.soundEngine))
        camera.addComponent(new WorldDrawerComponent(scene.canvas))

        api.setClientCameraEntity(camera)
        api.getClientWorld().appendChild(camera)

        return api
    }, [])

    const onDraw = useCallback((dt: number) => {
        RootControlsResponder.getInstance().refresh()
        let needsRedraw = mapEditor.getGame()?.serverLoop.runScheduledTasks(dt)

        if(!needsRedrawRef.current && !needsRedraw && !scene.canvas.needsResize) return
        needsRedrawRef.current = false

        let serverWorld = mapEditor.getServerWorld()
        let clientWorld = mapEditor.getClientWorld()
        
        serverWorld.emit("tick", dt)
        clientWorld.emit("tick", dt)
        clientWorld.emit("draw")
    }, [])

    useEffect(() => {
        scene.setTitle("Танчики - Редактор карт")
        scene.canvas.clear()
        scene.loop.start()

        let texture = Sprite.applyTexture(scene.canvas.ctx)
        
        return () => {
            Sprite.cleanupTexture(scene.canvas.ctx, texture)
            
            scene.setTitle(undefined)
            scene.loop.stop()
            mapEditor.getClientCameraEntity().removeFromParent()
            mapEditor.setClientCameraEntity(null)
        }
    }, [])

    useEffect(() => {
        scene.loop.on("tick", onDraw)
        return () => scene.loop.off("tick", onDraw)
    }, [])

    return (
        <ControlsProvider default ref={controlsResponderRef}>
            <MapEditorSceneContext.Provider value={mapEditor}>
                <EventsProvider ref={eventRef}>
                    <MapEditorSidebar/>
                    <ToolBarView/>
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
