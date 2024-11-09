/* @load-resource: './self-destruct-event-view.scss' */

import LargeIconEventView from "src/client/ui/overlay/events-overlay/types/large-icon-event-view";
import Entity from "src/utils/ecs/entity";
import TimerComponent from "src/entity/components/network/timer/timer-component";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";

export default class SelfDestructEventView extends LargeIconEventView {

    private arcCanvas = $("<canvas>").addClass("arc-canvas")
    private ctx: CanvasRenderingContext2D | null = null
    private canvasSize = 72
    private arcSize = 62
    private arcWidth = 5
    private timerEventListener = new BasicEventHandlerSet()
    private timer: Entity | null = null

    constructor() {
        super();
        this.element.addClass("self-destruct-event-view")
        this.icon.append(this.arcCanvas)

        this.title.text("Самоуничтожение...")

        this.subtitle.empty()
        this.subtitle.append(
            "Удерживайте ",
            $("<span>").addClass("key").text("R"),
        )

        this.timerEventListener.on("tick", () => {
            this.updateArc()
        })

        this.setupCanvas()
    }

    setupCanvas() {
        this.arcCanvas.attr({
            width: this.canvasSize * window.devicePixelRatio,
            height: this.canvasSize * window.devicePixelRatio
        })
        this.ctx = (this.arcCanvas[0] as HTMLCanvasElement).getContext("2d")
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
        this.ctx.strokeStyle = "#EBA2A2"
        this.ctx.lineWidth = this.arcWidth
    }

    setTimer(timer: Entity) {
        this.timer = timer
        this.timerEventListener.setTarget(timer)
    }

    private updateArc() {
        let timerComponent = this.timer.getComponent(TimerComponent)

        let respawnTime = timerComponent.originalTime
        let timeLeft = timerComponent.currentTime

        let center = this.canvasSize / 2
        let radius = this.arcSize / 2
        let angle = (respawnTime - timeLeft) / respawnTime * Math.PI * 2

        this.ctx.clearRect(0, 0, this.canvasSize, this.canvasSize)
        this.ctx.beginPath()
        this.ctx.arc(center, center, radius - this.arcWidth / 2, -Math.PI / 2 - angle, -Math.PI / 2)
        this.ctx.stroke()
    }
}