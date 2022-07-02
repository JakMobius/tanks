/* @load-resource: './tank-preview.scss' */

import StatScale from './stat-scale';
import Menu from 'src/client/ui/menu/menu';

export interface StatConfig {
    name: string;
    color: string;
    maximum: number;
    func: (value: number, maximum: number) => number;
}

export class Stat implements StatConfig {
	public name: string;
	public color: string;
	public maximum: number;
	public func: (value: number, maximum: number) => number;

    constructor(options: StatConfig) {
        this.name = options.name
        this.color = options.color
        this.maximum = options.maximum
        this.func = options.func || Stat.Linear
    }

    static Linear(value: number, maximum: number) {
        return value / maximum
    }

    static Reverse(value: number, maximum: number) {
        return maximum / value
    }
}

export default class TankPreviewContainer extends Menu {
	public tankPreview: JQuery;
	public previewCanvas: JQuery<HTMLCanvasElement>;
	public previewCtx: WebGLRenderingContext;
	public previewTitle: JQuery;
	public statContainer: JQuery;
	public descriptionBlock: JQuery;
	public statElements = new Map<string, StatScale>()
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
            func: Stat.Reverse,
        })],
        ["reload", new Stat({
            name: "ПЕРЕЗАРЯДКА",
            color: "#55D346",
            maximum: 1,
            func: Stat.Reverse,
        })]
    ])

    constructor() {
        super();

        this.element.addClass("tankinfo")

        this.tankPreview = $("<div></div>").addClass("tank-preview")

        this.previewCanvas = $("<canvas></canvas>")
        let canvas = this.previewCanvas[0]
        canvas.width = 155 * devicePixelRatio
        canvas.height = 155 * devicePixelRatio
        //this.previewCtx = canvas.getContext("2d")
        //this.previewCtx.scale(devicePixelRatio, devicePixelRatio)

        this.previewTitle = $("<h1>")

        this.tankPreview.append(this.previewCanvas)
        this.tankPreview.append(this.previewTitle)

        this.statContainer = $("<div></div>").addClass("tank-stats");
        this.descriptionBlock = $("<div></div>").addClass("description")

        this.element.append(this.tankPreview)
        this.element.append(this.statContainer)
        this.element.append(this.descriptionBlock)

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

    drawTank(tank: any) {
        //this.previewCtx.save()
        //this.previewCtx.clearRect(0, 0, 155, 155)
        //this.previewCtx.translate(155 / 2, 155 / 2);
        //this.previewCtx.scale(5, 5);

        // let drawer = new (tank.getDrawer())
        // drawer.draw(this.previewCtx, null)

        //this.previewCtx.restore()
    }

    applyStats(tank: any) {
        // let stats = tank.getStats()
        // for(let [key, element] of this.statElements.entries()) {
        //     const statValue = stats[key];
        //
        //     element.setValue(statValue)
        // }
    }

    previewTank(tank: any) {
        this.drawTank(tank)

        // this.previewTitle.text(tank.getName())
        // this.descriptionBlock.text(tank.getDescription())
        this.applyStats(tank)
    }
}