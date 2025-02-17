import "./map-editor-background-overlay.scss"

import {isMacOS} from "src/utils/meta-key-name";
import Matrix3 from "src/utils/matrix3";
import Overlay from "src/client/ui/overlay/overlay";
import { useEffect, useRef } from "react";
import React from "react";
import ReactDOM from "react-dom/client";

interface GestureEvent extends UIEvent {
    scale: number
}

interface MapEditorBackgroundOverlayProps {
    onZoom?: (scale: number) => void
    onDrag?: (dx: number, dy: number) => void
    onMouseDown?: (x: number, y: number) => void
    onMouseUp?: (x: number, y: number) => void
    onMouseMove?: (x: number, y: number) => void
    matrix?: Matrix3,
    draggingEnabled?: boolean
}

const MapEditorBackgroundOverlayComponent: React.FC<MapEditorBackgroundOverlayProps> = (props) => {

    const divRef = useRef<HTMLDivElement>(null)
    const ref = useRef({
        oldScale: null as number | null,
        oldX: null as number | null,
        oldY: null as number | null,
        dragging: false,
    })

    const zoomStart = (event: GestureEvent) => {
        event.preventDefault()
        ref.current.oldScale = event.scale
    }

    const zoomChange = (event: GestureEvent) => {
        event.preventDefault()
        if (isMacOS) {
            if (event.scale) {
                props.onZoom?.(event.scale / ref.current.oldScale)
                ref.current.oldScale = event.scale
            }
        }
    }

    const mouseDown = (event: MouseEvent) => {
        event.preventDefault()
        if ((event.button === 0 && props.draggingEnabled) || event.button === 1) {
            ref.current.dragging = true
        }

        ref.current.oldX = event.pageX
        ref.current.oldY = event.pageY

        let [x, y] = toUV(event.pageX, event.pageY, 1)

        props.onMouseDown?.(x, y)
    }

    const mouseUp = (event: MouseEvent) => {
        event.preventDefault()
        ref.current.dragging = false

        let [x, y] = toUV(event.pageX, event.pageY, 1)

        props.onMouseUp?.(x, y)
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

        let [x, y] = toUV(event.pageX, event.pageY, 1)

        props.onMouseMove?.(x, y)
    }

    const toUV = (x: number, y: number, z: number) => {
        if(!props.matrix) return [x, y]

        let normalizedX = (x / divRef.current.clientWidth) * 2 - z
        let normalizedY = (y / divRef.current.clientHeight) * 2 - z

        return [
            props.matrix.transformX(normalizedX, -normalizedY, z),
            props.matrix.transformY(normalizedX, -normalizedY, z)
        ]
    }

    const emitDrag = (dx: number, dy: number) => {
        let [x, y] = toUV(dx, dy, 0)
        props.onDrag?.(x, y)
    }

    const emitZoom = (movement: number) => {
        props.onZoom?.(1 - (movement / 200))
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
}

export default class MapEditorBackgroundOverlay extends Overlay {

    reactRoot: ReactDOM.Root
    props: MapEditorBackgroundOverlayProps

    constructor(props: MapEditorBackgroundOverlayProps) {
        super()
        this.props = props
        this.reactRoot = ReactDOM.createRoot(this.element[0])
        this.show()
        this.render()
    }

    render() {
        this.reactRoot.render(<MapEditorBackgroundOverlayComponent {...this.props}/>)
    }

    setDraggingEnabled(enabled: boolean) {
        this.props.draggingEnabled = enabled
        this.render()
    }
}