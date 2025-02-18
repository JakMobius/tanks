import Screen from "src/client/graphics/canvas-handler";
import GameProgramPool from "src/client/graphics/game-program-pool";
import Entity from "src/utils/ecs/entity";
import {gameWorldEntityPrefab} from "src/entity/game-world-entity-prefab";
import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import Sprite from "src/client/graphics/sprite";
import TilemapComponent from "src/physics/tilemap-component";
import GameMap from "src/map/game-map";
import ParticleHostComponent from "src/client/entity/components/particle-host-component";
import PhysicalComponent from "src/entity/components/physics-component";
import CameraPositionController from "src/entity/components/camera-position-controller";
import CameraComponent from "src/client/graphics/camera";
import React, { useEffect, useRef, useState } from "react";

const TankPreviewCanvas: React.FC = (props) => {

    let elementRef = useRef<HTMLDivElement | null>(null)
    let stateRef = useRef({
        tank: null as Entity | null,
        world: null as Entity | null,
        time: 0,
    })

    const setTankType = (type: number) => {
        stateRef.current.tank.removeFromParent()
        stateRef.current.tank = new Entity()
        ClientEntityPrefabs.types.get(type)(stateRef.current.tank)
        stateRef.current.world.appendChild(stateRef.current.tank)
    }

    const onFrame = (dt: number) => {
        stateRef.current.time += dt
        let component = stateRef.current.tank.getComponent(PhysicalComponent)
        component.setPositionAngle(component.getBody().GetPosition(), stateRef.current.time)

        // TODO: draw
    }

    useEffect(() => {
        let screen = new Screen({
            root: elementRef.current,
            fitRoot: false,
            width: 146,
            height: 139,
            withSound: false
        })

        stateRef.current.world = new Entity()
        let camera = new Entity()
        camera.addComponent(new CameraComponent())
        camera.addComponent(new CameraPositionController()
            .setViewport({x: screen.width, y: screen.height})
            .setBaseScale(12)
            .setDefaultPosition({x: 0, y: 0}))

        let programPool = new GameProgramPool(camera.getComponent(CameraComponent), screen.ctx)
        let drawPhase = new DrawPhase(programPool)

        Sprite.applyTexture(screen.ctx)

        // Disable Box2D stepping, as we are not using much physics
        // for this canvas.

        gameWorldEntityPrefab(stateRef.current.world, {
            physicsTick: 1 / 60,
            iterations: {
                positionIterations: 0,
                velocityIterations: 0
            }
        })

        stateRef.current.world.getComponent(TilemapComponent).setMap(new GameMap({
            width: 0,
            height: 0,
            data: []
        }))
        stateRef.current.world.addComponent(new ParticleHostComponent())
    }, [])

    return <div ref={elementRef} className="tank-preview-canvas"></div>
}

export default TankPreviewCanvas