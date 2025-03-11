import "./map-editor-background-overlay.scss"

import {isMacOS} from "src/utils/meta-key-name";
import { useEffect, useRef } from "react";
import React from "react";
import CameraComponent from "src/client/graphics/camera";
import Entity from "src/utils/ecs/entity";
import TransformComponent from "src/entity/components/transform/transform-component";

interface GestureEvent extends UIEvent {
    scale: number
}

interface MapEditorBackgroundOverlayProps {
    onZoom?: (scale: number) => void
    onDrag?: (dx: number, dy: number) => void
    onMouseDown?: (x: number, y: number) => void
    onMouseUp?: (x: number, y: number) => void
    onMouseMove?: (x: number, y: number) => void
    camera?: Entity,
    draggingEnabled?: boolean
}

const MapEditorBackgroundOverlay: React.FC<MapEditorBackgroundOverlayProps> = React.memo((props) => {

    const divRef = useRef<HTMLDivElement>(null)
    const ref = useRef({
        oldScale: null as number | null,
        oldX: null as number | null,
        oldY: null as number | null,
        dragging: false,
    })
    const propsRef = useRef<MapEditorBackgroundOverlayProps>(props)

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
                propsRef.current.onZoom?.(event.scale / ref.current.oldScale)
                ref.current.oldScale = event.scale
            }
        }
    }

    const mouseDown = (event: MouseEvent) => {
        event.preventDefault()
        if ((event.button === 0 && propsRef.current.draggingEnabled) || event.button === 1) {
            ref.current.dragging = true
        }

        ref.current.oldX = event.pageX
        ref.current.oldY = event.pageY

        let [x, y] = toWorld(event.pageX, event.pageY, 1)

        propsRef.current.onMouseDown?.(x, y)
    }

    const mouseUp = (event: MouseEvent) => {
        event.preventDefault()
        ref.current.dragging = false

        let [x, y] = toWorld(event.pageX, event.pageY, 1)

        propsRef.current.onMouseUp?.(x, y)
    }

    const mouseMove = (event: MouseEvent) => {
        event.preventDefault()

        if (ref.current.dragging) {
            let dx = -event.pageX + ref.current.oldX
            let dy = -event.pageY + ref.current.oldY

            emitDrag(dx, dy)
        }

        ref.current.oldX = event.pageX
        ref.current.oldY = event.pageY

        let [x, y] = toWorld(event.pageX, event.pageY, 1)

        propsRef.current.onMouseMove?.(x, y)
    }

    const toWorld = (x: number, y: number, z: number) => {
        const cameraTransform = propsRef.current.camera?.getComponent(TransformComponent)
        const cameraMatrix = cameraTransform?.getGlobalTransform()
        
        if(!cameraMatrix) return [x, y]

        let normalizedX = (x / divRef.current.clientWidth) * 2 - z
        let normalizedY = (y / divRef.current.clientHeight) * 2 - z

        return [
            cameraMatrix.transformX(normalizedX, -normalizedY, z),
            cameraMatrix.transformY(normalizedX, -normalizedY, z)
        ]
    }

    const emitDrag = (dx: number, dy: number) => {
        let [x, y] = toWorld(dx, dy, 0)
        propsRef.current.onDrag?.(x, y)
    }

    const emitZoom = (movement: number) => {
        propsRef.current.onZoom?.(1 - (movement / 150))
    }

    const onWheel = (event: WheelEvent) => {
        event.preventDefault()
        if (event.ctrlKey) {
            if (event.deltaY)
                emitZoom(event.deltaY)
        } else if (isMacOS) {
            if (event.deltaX || event.deltaY) {
                emitDrag(event.deltaX, event.deltaY)
            }

            if (event.deltaZ)
                emitZoom(-event.deltaZ)
        } else {
            emitZoom(event.deltaY)
        }
    }

    useEffect(() => {
        divRef.current.addEventListener("gesturestart", zoomStart, { passive: false })
        divRef.current.addEventListener("gesturechange", zoomChange, { passive: false })
        divRef.current.addEventListener("gestureend", zoomChange, { passive: false })
        divRef.current.addEventListener("mousedown", mouseDown, { passive: false })
        divRef.current.addEventListener("mouseup", mouseUp, { passive: false })
        divRef.current.addEventListener("mousemove", mouseMove, { passive: false })
        divRef.current.addEventListener("wheel", onWheel, { passive: false })
    }, [])

    return (
        <div ref={divRef} className="map-editor-background-overlay"/>
    )
})

export default MapEditorBackgroundOverlay