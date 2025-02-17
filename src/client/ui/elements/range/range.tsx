import './range.scss'

import React, { useCallback, useEffect } from 'react';

interface RangeViewProps {
    onChange?: (value: number) => void,
    value?: number
}

const RangeView: React.FC<RangeViewProps> = (props: RangeViewProps) => {

    const [state, setState] = React.useState({
        dragging: false,
        oldX: null as number | null,
    })

    const trackRef = React.useRef<HTMLDivElement>(null)

    const onMouseUp = (event: MouseEvent) => {
        onMouseMove(event)
        setState((state) => ({
            ...state,
            dragging: false
        }))
    }

    const onMouseMove = (event: MouseEvent) => {
        let trackWidth = trackRef.current.clientWidth
        let newValue = props.value + (event.pageX - state.oldX) / trackWidth

        setState((state) => {
            return {
                ...state,
                value: Math.min(1, Math.max(0, newValue)),
                oldX: event.pageX
            }
        })

        props.onChange?.(newValue)
    }

    const onMouseDown = useCallback((event: React.MouseEvent) => {
        setState((state) => ({
            ...state,
            oldX: event.pageX,
            dragging: true
        }))
    }, [])

    useEffect(() => {
        setState((state) => ({
            ...state,
            value: props.value ?? 0
        }))
    }, [])

    useEffect(() => {
        if(!state.dragging) return () => {}

        document.addEventListener("mouseup", onMouseUp)
        document.addEventListener("mousemove", onMouseMove)

        return () => {
            document.removeEventListener("mouseup", onMouseUp)
            document.removeEventListener("mousemove", onMouseMove)
        }
    }, [state.dragging])

    return (
        <div className="range-input">
            <div className="track" ref={trackRef}></div>
            <div className="thumb-container">
                <div
                    className="thumb"
                    onMouseDown={onMouseDown}
                    style={{ left: (props.value * 100).toFixed(2) + "%" }}
                ></div>
            </div>
        </div>
    )
}

export default RangeView;