
import DrawPhase from "src/client/graphics/drawers/draw-phase";
import LineDrawer from "src/client/graphics/drawers/line-drawer";
import ConvexShapeProgram from "src/client/graphics/programs/convex-shapes/convex-shape-program";
import {clamp} from "src/utils/utils";

export interface DebugDrawerPlotEntry {
    time: number,
    value: number
}

export class DebugDrawerPlot {
    plots = new Map<number, DebugDrawerPlotEntry[]>()

    timeWidth: number = 2

    private update() {
        for(let plotData of this.plots.values()) {
            this.updatePlot(plotData)
        }
    }

    private updatePlot(plotData: DebugDrawerPlotEntry[]) {
        if(!plotData.length) return

        let time = Date.now() / 1000

        // Trim data if it's too long
        if(plotData[0].time < time - this.timeWidth * 2) {
            // Find index of first visible element
            let i = 0
            while(plotData[i] && plotData[i].time < time - this.timeWidth) {
                i++
            }
            plotData.splice(0, i)
        }
    }

    plot(color: number, value: number, time: number) {
        value = clamp(value, -1, 1);
        if(!this.plots.has(color)) {
            this.plots.set(color, [])
        }

        if(!this.plots.get(color)) {
            this.plots.set(color, [])
        } else {
            let length = this.plots.get(color).length
            if(length > 0) {
                let last = this.plots.get(color)[length - 1]
                if(last.time >= time) {
                    last.value = value
                    return
                }
            }
            this.plots.get(color).push({
                time: time,
                value: value
            })
            this.updatePlot(this.plots.get(color))
        }
    }

    draw(phase: DrawPhase, x: number, y: number, width: number, height: number) {
        phase.getProgram(ConvexShapeProgram).drawConvexShape([
            x, y,
            x + width, y,
            x + width, y + height,
            x, y + height
        ], 0x33000000)
        this.update()

        let time = Date.now() / 1000

        for(let [color, plotData] of this.plots.entries()) {
            let lastX = 0
            let lastY = 0
            for(let i = 0; i < plotData.length; i++) {
                let entry = plotData[i]

                let lineX = ((entry.time - time) / this.timeWidth + 1) * width
                let lineY = (height / 2) + (entry.value / 2) * height

                if(lastX < 0) {
                    // Interpolate between (lastX, lastY) and (lineX, lineY)
                    let t = -lastX / (lineX - lastX)
                    lastX = 0
                    lastY = lastY + (lineY - lastY) * t
                }

                if(lineX > 0 && i > 0) {
                    LineDrawer.drawLine(phase, lastX + x, lastY + y, lineX + x, lineY + y, color, 1)
                }

                lastX = lineX
                lastY = lineY
            }
        }
    }
}

export default class DebugDrawer {
    public static instance: DebugDrawer = new DebugDrawer()

    plotData = new DebugDrawerPlot()
}