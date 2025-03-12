
import HubPage from "src/client/ui/hub-page/hub-page";
import {UserDataRaw} from "src/client/utils/user-data-raw";
import Entity from "src/utils/ecs/entity";
import {getHubMap} from "src/client/hub/hub-map";
import TransformComponent from "src/entity/components/transform/transform-component";
import CameraComponent from "src/client/graphics/camera";
import WorldDrawerComponent from "src/client/entity/components/world-drawer-component";
import CameraRandomMovement from "src/entity/components/camera-random-movement";

import React, { useEffect } from "react";
import SceneController, { useScene } from "../scenes/scene-controller";
import RootControlsResponder from "../controls/root-controls-responder";
import TilemapComponent from "src/map/tilemap-component";
import { readEntityFile } from "src/map/map-serialization";
import { TexturesResourcePrerequisite, usePrerequisites } from "../scenes/scene-prerequisite";
import LoadingScene from "../scenes/loading/loading-scene";
import Sprite from "../graphics/sprite";
import EmbeddedServerGame from "../embedded-server/embedded-server-game";
import WorldDataPacket from "src/networking/packets/game-packets/world-data-packet";
import EntityDataReceiveComponent from "src/entity/components/network/receiving/entity-data-receive-component";
import WriteBuffer from "src/serialization/binary/write-buffer";
import PlayerPrefab from "src/entity/types/player/server-prefab";
import PlayerWorldComponent from "src/entity/types/player/server-side/player-world-component";
import PlayerConnectionManagerComponent from "src/entity/types/player/server-side/player-connection-manager-component";
import { gameEntityFactory } from "../game/game-entity-factory";

const HubView: React.FC = () => {
    const scene = useScene()

    const [state, setState] = React.useState({
        camera: null as Entity | null,
        backgroundWorld: null as Entity | null,
        game: null as EmbeddedServerGame | null
    })
    
    const onDraw = (dt: number) => {
        RootControlsResponder.getInstance().refresh()
        state.camera?.getComponent(CameraComponent)
            .setViewport({x: scene.canvas.width, y: scene.canvas.height})
        state.game?.tick(dt)
        state.backgroundWorld?.emit("draw")
    }

    useEffect(() => {
        scene.setTitle("Танчики - Хаб")
        scene.loop.start()
        scene.canvas.clear()

        const game = new EmbeddedServerGame()
        game.clientWorld.getComponent(EntityDataReceiveComponent).makeRoot(gameEntityFactory)

        const map = readEntityFile(getHubMap()).createEntity()
        game.serverGame.appendChild(map)

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

        const camera = new Entity()
        camera.addComponent(new TransformComponent())
        camera.addComponent(new CameraComponent()
            .setViewport({x: scene.canvas.width, y: scene.canvas.height}))
        camera.addComponent(new CameraRandomMovement()
            .setMapSize(150 * TilemapComponent.DEFAULT_SCALE, 150 * TilemapComponent.DEFAULT_SCALE))

        camera.addComponent(new WorldDrawerComponent(scene.canvas))

        game.clientWorld.appendChild(camera)
        game.connectClientToServer()

        setState({
            camera: camera,
            backgroundWorld: game.clientWorld,
            game: game
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