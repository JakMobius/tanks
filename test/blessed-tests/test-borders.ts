
import * as blessed from 'src/library/blessed-fork/lib/blessed'
import {TTYColor} from "src/library/blessed-fork/lib/blessed";

const screen = new blessed.Screen({
    smartCSR: true,
    fullUnicode: true
})

const container = new blessed.Box({
    position: screen.position,
    style: {
        bg: new TTYColor("black"),
        border: {
            left: true,
            right: true,
            bottom: true,
            top: true,
            type: 'line',
            fg: new TTYColor("white"),
            bg: new TTYColor("black")
        }
    }
})

const nestedContainer = new blessed.Box({
    position: {
        x: 4,
        y: 4
        // width: auto
        // height: auto
    },
    style: {
        bg: new TTYColor("magenta"),
        fg: new TTYColor("white"),
        border: {
            left: true,
            right: true,
            bottom: true,
            top: true,
            type: 'line',
            fg: new TTYColor("white"),
            bg: new TTYColor("magenta")
        }
    }
})

const borderedBox = new blessed.Box({
    position: {
        x: 5,
        y: 5,
        width: 50,
        height: 10
    },
    style: {
        border: {
            left: true,
            right: true,
            bottom: true,
            top: true,
            type: 'line',
            fg: new TTYColor("white"),
            bg: new TTYColor("blue")
        },
        fg: new TTYColor("white"),
        bg: new TTYColor("blue")
    },
    shadow: true,
    padding: {
        left: 1,
        right: 1
    },
    content: "Hey! i am a box. I look like a DOS window, right? Call me dox"
})

function onResize() {
    nestedContainer.position.width = container.position.width - 8
    nestedContainer.position.height = container.position.height - 8
}

container.on('resize', () => {
    onResize()
})

onResize()

screen.key("C-c", () => {
    screen.destroy()
})

screen.append(container)
container.append(nestedContainer)
nestedContainer.append(borderedBox)
screen.setNeedsRender()