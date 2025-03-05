
import HubPage from "src/client/ui/hub-page/hub-page";
import {UserDataRaw} from "src/client/utils/user-data-raw";
import Entity from "src/utils/ecs/entity";
import {clientGameWorldEntityPrefab} from "src/client/entity/client-game-world-entity-prefab";
import {getHubMap} from "src/client/hub/hub-map";
import TransformComponent from "src/entity/components/transform-component";
import CameraComponent from "src/client/graphics/camera";
import WorldDrawerComponent from "src/client/entity/components/world-drawer-component";
import CameraRandomMovement from "src/entity/components/camera-random-movement";

import React, { useEffect } from "react";
import SceneController, { useScene } from "../scenes/scene-controller";
import RootControlsResponder from "../controls/root-controls-responder";
import ClientEntityPrefabs from "../entity/client-entity-prefabs";
import TilemapComponent from "src/map/tilemap-component";
import { readMapFile } from "src/map/map-serialization";
import { EntityType } from "src/entity/entity-type";
import { TexturesResourcePrerequisite, usePrerequisites } from "../scenes/scene-prerequisite";
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
        state.camera?.getComponent(CameraRandomMovement)
            .setViewport({x: scene.canvas.width, y: scene.canvas.height})
        state.backgroundWorld?.emit("tick", dt)
        state.backgroundWorld?.emit("draw")
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
        scene.loop.on("tick", onDraw)
        return () => scene.loop.off("tick", onDraw)
    }, [onDraw])

    let userData = (window as any).userData as any as UserDataRaw
    return <HubPage userData={userData}/>
}

const HubScene: React.FC = () => {
    const prerequisites = usePrerequisites(() => [
        new TexturesResourcePrerequisite()
    ])

    if(prerequisites.loaded) {
        return <HubView/>
    } else {
        return <LoadingScene progress={prerequisites.progress} error={prerequisites.error}/>
    }
}

SceneController.shared.registerScene("hub", HubScene);