/* @load-resource: './tank-preview.scss' */

const View = require("../../../../../ui/view")
const StatScale = require("./statscale")

class Stat {
    constructor(options) {
        this.name = options.name
        this.color = options.color
        this.maximum = options.maximum
        this.func = options.func || Stat.Linear()
    }

    static Linear(value, maximum) {
        return value / maximum
    }

    static Reversive(value, maximum) {
        return maximum / value
    }
}

class TankPreviewContainer extends View {

    static stats = new Map([
        ["damage", new Stat({
            name: "УРОН",
            color: "#E82020",
            maximum: 7,
            func: Stat.Linear
        })],
        ["health", new Stat({
            name: "БРОНЯ",
            color: "#D657FF",
            maximum: 20,
            func: Stat.Linear
        })],
        ["speed", new Stat({
            name: "СКОРОСТЬ",
            color: "#FF8E26",
            maximum: 120,
            func: Stat.Linear
        })],
        ["shootrate", new Stat({
            name: "СКОРОСТРЕЛЬНОСТЬ",
            color: "#1CBCEF",
            maximum: 0.2,
            func: Stat.Reversive,
        })],
        ["reload", new Stat({
            name: "ПЕРЕЗАРЯДКА",
            color: "#55D346",
            maximum: 1,
            func: Stat.Reversive,
        })]
    ])

    constructor() {
        super();

        this.element.addClass("menu tankinfo")

        this.tankPreview = $("<div></div>").addClass("tank-preview")

        this.previewCanvas = $("<canvas></canvas>")
        let canvas = this.previewCanvas[0]
        canvas.width = 155 * devicePixelRatio
        canvas.height = 155 * devicePixelRatio
        this.previewCtx = canvas.getContext("2d")
        this.previewCtx.scale(devicePixelRatio, devicePixelRatio)

        this.previewTitle = $("<h1>")

        this.tankPreview.append(this.previewCanvas)
        this.tankPreview.append(this.previewTitle)

        this.statContainer = $("<div></div>").addClass("tank-stats");
        this.descriptionBlock = $("<div></div>").addClass("description")

        this.element.append(this.tankPreview)
        this.element.append(this.statContainer)
        this.element.append(this.descriptionBlock)

        this.statElements = new Map()
        this.setupStats()
    }

    setupStats() {
        for(let [key, stat] of TankPreviewContainer.stats.entries()) {
            let element = new StatScale()
            this.statContainer.append(element.element)
            element.setStat(stat)
            this.statElements.set(key, element)
        }
    }

    drawTank(tank) {
        this.previewCtx.save()
        this.previewCtx.clearRect(0, 0, 155, 155)
        this.previewCtx.translate(155 / 2, 155 / 2);
        this.previewCtx.scale(5, 5);

        // let drawer = new (tank.getDrawer())
        // drawer.draw(this.previewCtx, null)

        this.previewCtx.restore()
    }

    applyStats(tank) {
        for(let [key, element] of this.statElements.entries()) {
            const statValue = tank.getStats()[key];

            element.setValue(statValue)
        }
    }

    previewTank(tank) {
        this.drawTank(tank)

        this.previewTitle.text(tank.getName())
        this.descriptionBlock.text(tank.getDescription())
        this.applyStats(tank)
    }
}

module.exports = TankPreviewContainer