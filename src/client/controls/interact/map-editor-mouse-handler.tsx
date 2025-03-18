import {isMacOS} from "src/utils/meta-key-name";
import { useEffect, useRef } from "react";
import React from "react";
import CameraComponent from "src/client/graphics/camera";
import TransformComponent from "src/entity/components/transform/transform-component";
import { useScene } from "src/client/scenes/scene-controller";
import { useMapEditor } from "src/client/map-editor/map-editor-scene";

interface GestureEvent extends UIEvent {
    scale: number
}

interface MapEditorMouseHandlerProps {
    onZoom?: (scale: number, x: number, y: number) => void
    onDrag?: (dx: number, dy: number) => void
    onMouseDown?: (x: number, y: number) => void
    onMouseUp?: (x: number, y: number) => void
    onMouseMove?: (x: number, y: number) => void
}

export const MapEditorMouseHandler: React.FC<MapEditorMouseHandlerProps> = React.memo((props) => {

    const scene = useScene()
    const mapEditor = useMapEditor()
    const ref = useRef({
        oldScale: null as number | null,
        oldX: null as number | null,
        oldY: null as number | null,
        dragging: false,
    })
    const propsRef = useRef<MapEditorMouseHandlerProps>(props)

    useEffect(() => {
        propsRef.current = props
    }, [props])

    const zoomStart = (event: GestureEvent) => {
        event.preventDefault()
        ref.current.oldScale = event.scale
    }

    const zoomChange = (event: GestureEvent) => {
        event.preventDefault()
        if (isMacOS) {
            if (event.scale) {
                emitZoom(event.scale / ref.current.oldScale)
                ref.current.oldScale = event.scale
            }
        }
    }

    const mouseDown = (event: MouseEvent) => {
        ref.current.oldX = event.pageX
        ref.current.oldY = event.pageY

        let [x, y] = toWorld(event.pageX, event.pageY, 1)

        propsRef.current.onMouseDown?.(x, y)
    }

    const mouseUp = (event: MouseEvent) => {
        let [x, y] = toWorld(event.pageX, event.pageY, 1)

        propsRef.current.onMouseUp?.(x, y)
    }

    const mouseMove = (event: MouseEvent) => {
        ref.current.oldX = event.pageX
        ref.current.oldY = event.pageY

        let [x, y] = toWorld(event.pageX, event.pageY, 1)

        propsRef.current.onMouseMove?.(x, y)
    }

    const toWorld = (x: number, y: number, z: number) => {
        const cameraTransform = mapEditor.getClientCameraEntity()?.getComponent(TransformComponent)
        const cameraMatrix = cameraTransform?.getGlobalTransform()

        const canvas = scene.canvas.canvas
        if(!(canvas instanceof HTMLCanvasElement)) return [0, 0]
        
        if(!cameraMatrix) return [x, y]

        let normalizedX = (x / canvas.clientWidth) * 2 - z
        let normalizedY = (y / canvas.clientHeight) * 2 - z

        return [
            cameraMatrix.transformX(normalizedX, -normalizedY, z),
            cameraMatrix.transformY(normalizedX, -normalizedY, z)
        ]
    }

    const emitDrag = (dx: number, dy: number) => {
        let [x, y] = toWorld(dx, dy, 0)
        propsRef.current.onDrag?.(x, y)
    }

    const emitZoom = (zoom: number) => {
        let viewport = mapEditor.getClientCameraEntity().getComponent(CameraComponent).viewport
        let x = (ref.current.oldX / viewport.x) * 2 - 1
        let y = (ref.current.oldY / viewport.y) * 2 - 1

        propsRef.current.onZoom?.(zoom, x, y)
    }

    const emitScrollZoom = (movement: number) => {
        emitZoom(1 - (movement / 150))
    }

    const onWheel = (event: WheelEvent) => {
        event.preventDefault()
        if (event.ctrlKey) {
            if (event.deltaY)
                emitScrollZoom(event.deltaY)
        } else if (isMacOS) {
            if (event.deltaX || event.deltaY) {
                emitDrag(event.deltaX, event.deltaY)
            }

            if (event.deltaZ)
                emitZoom(-event.deltaZ)
        } else {
            emitScrollZoom(event.deltaY)
        }
    }

    useEffect(() => {
        let abortController = new AbortController()
        let signal = abortController.signal
        let canvas = scene.canvas.canvas

        canvas.addEventListener("gesturestart", zoomStart, { passive: false, signal })
        canvas.addEventListener("gesturechange", zoomChange, { passive: false, signal })
        canvas.addEventListener("gestureend", zoomChange, { passive: false, signal })
        canvas.addEventListener("mousedown", mouseDown, { passive: false, signal })
        canvas.addEventListener("mouseup", mouseUp, { passive: false, signal })
        canvas.addEventListener("mousemove", mouseMove, { passive: false, signal })
        canvas.addEventListener("wheel", onWheel, { passive: false, signal })

        return () => abortController.abort()
    }, [])

    return <></>
})