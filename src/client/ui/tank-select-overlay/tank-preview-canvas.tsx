import Entity from "src/utils/ecs/entity";
import {gameWorldEntityPrefab} from "src/entity/game-world-entity-prefab";
import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import ParticleHostComponent from "src/client/entity/components/particle-host-component";
import PhysicalComponent from "src/entity/components/physics-component";
import CameraPositionController from "src/entity/components/camera-position-controller";
import CameraComponent from "src/client/graphics/camera";
import React, { useContext, useEffect, useRef } from "react";
import WorldDrawerComponent from "src/client/entity/components/world-drawer-component";
import { TankSelectCarouselContext } from "./tank-select-overlay";
import TransformComponent from "src/entity/components/transform/transform-component";

interface TankPreviewCanvasProps {
    tankType: number | null
}

const TankPreviewCanvas: React.FC<TankPreviewCanvasProps> = (props) => {

    let canvasRef = useRef<HTMLCanvasElement | null>(null)
    let stateRef = useRef({
        tank: null as Entity | null,
        world: null as Entity | null,
        time: 0,
        ctx: null as CanvasRenderingContext2D | null
    })

    const drawContext = useContext(TankSelectCarouselContext)

    const onFrame = (dt: number) => {
        stateRef.current.time += dt
        let component = stateRef.current.tank?.getComponent(TransformComponent)
        component?.setGlobal({
            position: component.getGlobalPosition(),
            angle: stateRef.current.time
        })

        drawContext.canvas.clear()
        stateRef.current.world.emit("tick", dt)
        stateRef.current.world.emit("draw")
        stateRef.current.ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        stateRef.current.ctx.drawImage(drawContext.canvas.canvas, 0, 0)
    }

    useEffect(() => {
        drawContext.ticker.on("tick", onFrame)
        canvasRef.current.width = drawContext.canvas.width * drawContext.canvas.scale
        canvasRef.current.height = drawContext.canvas.height * drawContext.canvas.scale
        stateRef.current.ctx = canvasRef.current?.getContext("2d")

        stateRef.current.world = new Entity()
        let camera = new Entity()
        camera.addComponent(new TransformComponent())
        camera.addComponent(new CameraComponent())
        camera.addComponent(new CameraPositionController()
            .setViewport({x: drawContext.canvas.width, y: drawContext.canvas.height})
            .setBaseScale(12)
            .setDefaultPosition({x: 0, y: 0}))
        camera.addComponent(new WorldDrawerComponent(drawContext.canvas))

        // Disable Box2D stepping, as we don't use much physics here

        gameWorldEntityPrefab(stateRef.current.world, {
            physicsTick: 1 / 60,
            iterations: {
                positionIterations: 0,
                velocityIterations: 0
            }
        })

        stateRef.current.world.addComponent(new ParticleHostComponent())
        stateRef.current.world.appendChild(camera)

        return () => {
            camera.removeFromParent()
            drawContext.ticker.off("tick", onFrame)
        }
    }, [])

    useEffect(() => {
        if(props.tankType === null) return undefined
        
        stateRef.current.tank = new Entity()
        ClientEntityPrefabs.types.get(props.tankType)(stateRef.current.tank)
        stateRef.current.world.appendChild(stateRef.current.tank)
        return () => stateRef.current.tank.removeFromParent()
    }, [props.tankType])

    return (
        <canvas ref={canvasRef} className="tank-preview-canvas"/>
    )
}

export default TankPreviewCanvas