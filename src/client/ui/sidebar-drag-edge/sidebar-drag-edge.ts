import { RefObject, useCallback, useEffect, useRef, useState } from "react"

interface DraggerProps {
    onDrag?: (dx: number, dy: number) => void
    contents: (ref: RefObject<HTMLElement>) => React.ReactNode
}

const Dragger: React.FC<DraggerProps> = (props) => {
    
    const [dragging, setDragging] = useState(false) 
    const savedDragOffset = useRef<{x: number, y: number} | null>(null)
    const draggerRef = useRef<HTMLElement | null>(null)

    useEffect(() => {
        if(!dragging) return undefined
        let onMouseMove = (event: MouseEvent) => {
            event.stopPropagation()
            event.preventDefault()
            let rect = draggerRef.current.getBoundingClientRect()
            let dx = event.clientX - rect.x
            let dy = event.clientY - rect.y
            props.onDrag?.(dx, dy)
        }

        let onMouseUp = (event: MouseEvent) => {
            event.stopPropagation()
            event.preventDefault()
            setDragging(false)
            savedDragOffset.current = null
        }

        document.addEventListener("mousemove", onMouseMove)
        document.addEventListener("mouseup", onMouseUp)

        return () => {
            document.removeEventListener("mousemove", onMouseMove)
            document.removeEventListener("mouseup", onMouseUp)
        }
    }, [dragging])

    const onDragEdgeMouseDown = useCallback((event: MouseEvent) => {
        event.stopPropagation()
        event.preventDefault()
        setDragging(true)
        let rect = draggerRef.current.getBoundingClientRect()
        savedDragOffset.current = {
            x: event.clientX - rect.x,
            y: event.clientY - rect.y
        }
    }, [])

    useEffect(() => {
        if(!draggerRef.current) return undefined
        draggerRef.current.addEventListener("mousedown", onDragEdgeMouseDown)
        return () => draggerRef.current.removeEventListener("mousedown", onDragEdgeMouseDown)
    }, [draggerRef.current])

    return props.contents(draggerRef)
}

export default Dragger