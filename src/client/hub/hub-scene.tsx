
import HubPage from "src/client/hub/ui/hub-page";
import {UserDataRaw} from "src/client/utils/user-data-raw";
import Entity from "src/utils/ecs/entity";
import {clientGameWorldEntityPrefab} from "src/client/entity/client-game-world-entity-prefab";
import {getHubMap} from "src/client/hub/hub-map";
import GameMap from "src/map/game-map";
import TransformComponent from "src/entity/components/transform-component";
import CameraComponent from "src/client/graphics/camera";
import WorldDrawerComponent from "src/client/entity/components/world-drawer-component";
import CameraRandomMovement from "src/entity/components/camera-random-movement";

import React, { useEffect } from "react";
import SceneController, { useScene } from "../scenes/scene-controller";
import { BasicSceneDescriptor } from "../scenes/scene-descriptor";
import { texturesResourcePrerequisite } from "../scenes/scene-prerequisite";

const HubScene: React.FC = () => {
    const scene = useScene()

    const [state, setState] = React.useState({
        camera: null as Entity | null,
        backgroundWorld: null as Entity | null
    })
    
    const onDraw = (dt: number) => {
        state.backgroundWorld?.emit("tick", dt)
        state.backgroundWorld?.emit("draw")
        state.camera?.getComponent(CameraRandomMovement)
            .setViewport({x: scene.canvas.width, y: scene.canvas.height})
    }

    useEffect(() => {
        scene.setTitle("Танчики - Хаб")
        scene.loop.start()

        const map = getHubMap()
        const backgroundWorld = new Entity()
        clientGameWorldEntityPrefab(backgroundWorld, {
            map: map
        })

        const camera = new Entity()
        camera.addComponent(new TransformComponent())
        camera.addComponent(new CameraComponent())
        camera.addComponent(new CameraRandomMovement()
            .setViewport({x: scene.canvas.width, y: scene.canvas.height})
            .setMapSize(map.width * GameMap.BLOCK_SIZE, map.height * GameMap.BLOCK_SIZE))

        camera.addComponent(new WorldDrawerComponent(scene.canvas))

        backgroundWorld.appendChild(camera)

        setState({
            camera: camera,
            backgroundWorld: backgroundWorld
        })

        return () => {
            // TODO: This is wrong
            camera.removeComponent(WorldDrawerComponent)
            
            scene.setTitle(undefined)
            scene.loop.stop()
            camera.removeFromParent()
        }
    }, [])

    useEffect(() => {
        scene.loop.run = onDraw
        return () => scene.loop.run = null
    }, [onDraw])

    let userData = (window as any).userData as any as UserDataRaw
    return <HubPage userData={userData}/>
}

SceneController.shared.registerScene("hub", () => new BasicSceneDescriptor([
    texturesResourcePrerequisite
], () => <HubScene/>));