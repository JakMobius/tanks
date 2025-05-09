import './self-destruct-event-view.scss'

import LargeIconEventView from "src/client/ui/events-hud/types/large-icon-event-view";
import Entity from "src/utils/ecs/entity";
import React, { useEffect } from 'react';
import { useEvent } from '../events-hud';
import TimerComponent from 'src/entity/types/timer/timer-component';

interface SelfDestructEventViewProps {
    timer: Entity
}

const SelfDestructEventView: React.FC<SelfDestructEventViewProps> = (props) => {

    const event = useEvent()

    const canvasRef = React.useRef<HTMLCanvasElement>(null)
    const ctxRef = React.useRef<CanvasRenderingContext2D | null>(null)

    const canvasSize = 72
    const arcSize = 62
    const arcWidth = 5

    useEffect(() => {
        if(!canvasRef.current) return undefined
        let canvas = canvasRef.current
        canvas.width = canvasSize * window.devicePixelRatio
        canvas.height = canvasSize * window.devicePixelRatio

        let ctx = canvas?.getContext("2d")
        ctxRef.current = ctx

        if (ctx) {
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
            ctx.strokeStyle = "#EBA2A2"
            ctx.lineWidth = 5
        }

        return () => ctxRef.current = null
    }, [canvasRef.current])

    const updateArc = () => {
        let ctx = ctxRef.current
        if(!ctx) return

        let timerComponent = props.timer.getComponent(TimerComponent)

        let respawnTime = timerComponent.originalTime
        let timeLeft = timerComponent.currentTime

        let center = canvasSize / 2
        let radius = arcSize / 2
        let angle = (respawnTime - timeLeft) / respawnTime * Math.PI * 2

        ctx.clearRect(0, 0, canvasSize, canvasSize)
        ctx.beginPath()
        ctx.arc(center, center, radius - arcWidth / 2, -Math.PI / 2 - angle, -Math.PI / 2)
        ctx.stroke()
    }

    useEffect(() => {
        if(!props.timer) {
            event.remove()
            return undefined
        }
        props.timer.on("tick", updateArc)
        return () => props.timer.off("tick", updateArc)
    }, [props.timer])

    return (
        <LargeIconEventView icon={
            <div className="self-destruct-event-icon">
                <canvas ref={canvasRef} className="arc-canvas"/>
            </div>
        }>
            <div className="self-destruct-event-title">
                Самоуничтожение...
            </div>
            <div className="self-destruct-event-subtitle">
                Удерживайте <span className="key">R</span>
            </div>
        </LargeIconEventView>
    )
}

export default SelfDestructEventView