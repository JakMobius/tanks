
import HubPage from "src/client/hub/ui/hub-page";
import {UserDataRaw} from "src/client/utils/user-data-raw";
import Entity from "src/utils/ecs/entity";
import {clientGameWorldEntityPrefab} from "src/client/entity/client-game-world-entity-prefab";
import {getHubMap} from "src/client/hub/hub-map";
import TransformComponent from "src/entity/components/transform-component";
import CameraComponent from "src/client/graphics/camera";
import WorldDrawerComponent from "src/client/entity/components/world-drawer-component";
import CameraRandomMovement from "src/entity/components/camera-random-movement";

import React, { useEffect, useState } from "react";
import SceneController, { useScene } from "../scenes/scene-controller";
import { BasicSceneDescriptor } from "../scenes/scene-descriptor";
import RootControlsResponder from "../controls/root-controls-responder";
import ClientEntityPrefabs from "../entity/client-entity-prefabs";
import TilemapComponent from "src/map/tilemap-component";
import { readMapFile } from "src/map/map-serialization";
import { EntityType } from "src/entity/entity-type";
import { convertErrorToLoadingError, LoadingError } from "../scenes/loading/loading-error";
import { Progress } from "../utils/progress";
import { ScenePrerequisite, TexturesResourcePrerequisite } from "../scenes/scene-prerequisite";
import LoadingScene from "../scenes/loading/loading-scene";
import Sprite from "../graphics/sprite";

const HubView: React.FC = () => {
    const scene = useScene()

    const [state, setState] = React.useState({
        camera: null as Entity | null,
        backgroundWorld: null as Entity | null
    })
    
    const onDraw = (dt: number) => {
        RootControlsResponder.getInstance().refresh()
        state.backgroundWorld?.emit("tick", dt)
        state.backgroundWorld?.emit("draw")
        state.camera?.getComponent(CameraRandomMovement)
            .setViewport({x: scene.canvas.width, y: scene.canvas.height})
    }

    useEffect(() => {
        scene.setTitle("Танчики - Хаб")
        scene.loop.start()
        scene.canvas.clear()

        const backgroundWorld = new Entity()
        clientGameWorldEntityPrefab(backgroundWorld)

        const {width, height, blocks} = readMapFile(getHubMap())

        const tilemap = new Entity()
        ClientEntityPrefabs.types.get(EntityType.TILEMAP)(tilemap)
        tilemap.getComponent(TilemapComponent).setMap(width, height, blocks)
        backgroundWorld.appendChild(tilemap)

        const camera = new Entity()
        camera.addComponent(new TransformComponent())
        camera.addComponent(new CameraComponent())
        camera.addComponent(new CameraRandomMovement()
            .setViewport({x: scene.canvas.width, y: scene.canvas.height})
            .setMapSize(width * TilemapComponent.BLOCK_SIZE, height * TilemapComponent.BLOCK_SIZE))

        camera.addComponent(new WorldDrawerComponent(scene.canvas))

        backgroundWorld.appendChild(camera)

        setState({
            camera: camera,
            backgroundWorld: backgroundWorld
        })

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

    let userData = (window as any).userData as any as UserDataRaw
    return <HubPage userData={userData}/>
}

const HubScene: React.FC = () => {

    const scene = useScene()
    const [state, setState] = useState({
        loaded: false,
        error: null as LoadingError | null,
        progress: null as Progress | null
    })

    const onError = (error: Error) => {
        setState(state => ({
            ...state,
            progress: null,
            loaded: false,
            error: convertErrorToLoadingError(error)
        }))
    }

    useEffect(() => {
        let progress = ScenePrerequisite.toProgress([
            new TexturesResourcePrerequisite(),
        ], scene)
        
        const onCompleted = () => setState(state => ({ ...state, loaded: true }))
        
        progress.on("completed", onCompleted)
        progress.on("error", onError)

        setState(state => ({ ...state, progress }))

        return () => progress.abort()
    }, [])

    if(state.loaded) {
        return <HubView/>
    } else {
        return <LoadingScene progress={state.progress} error={state.error}/>
    }
}

SceneController.shared.registerScene("hub", HubScene);