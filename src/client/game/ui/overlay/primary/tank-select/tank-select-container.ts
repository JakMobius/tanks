/* @load-resource: './tank-select.scss' */

import Menu from 'src/client/ui/menu/menu';

import TankSelectElement from './tank-select-element';
import Camera from 'src/client/camera';
import * as Box2D from 'src/library/box2d';
import RenderLoop from 'src/utils/loop/render-loop';
import ClientTank, {ClientTankType} from "../../../../../entity/tank/client-tank";
import ClientSniperTank from "../../../../../entity/tank/types/client-sniper-tank";

export default class TankSelectContainer extends Menu {
	public shadowLeft: JQuery;
	public shadowRight: JQuery;
	public container: JQuery;
	public leftShadowHidden: boolean;
	public rightShadowHidden: boolean;
	public selectedTank: ClientTankType
	public previewCamera: Camera;
	public previewWorld: Box2D.World;
	public loop: RenderLoop;
	public containers: TankSelectElement[];

    constructor() {
        super();

        this.element.addClass("tankselect")

        this.shadowLeft = $("<div>").addClass("shadow left");
        this.shadowRight = $("<div>").addClass("shadow right");

        this.container = $("<div>").addClass("tank-select-container")
        this.element.append(this.container, this.shadowLeft, this.shadowRight)

        this.leftShadowHidden = false
        this.rightShadowHidden = false

        this.selectedTank = null

        this.previewCamera = new Camera({
            baseScale: 2,
            viewport: new Box2D.Vec2(70, 70),
            defaultPosition: new Box2D.Vec2(0, 0),
            inertial: true
        })

        this.previewCamera.tick(0)
        this.previewWorld = new Box2D.World(new Box2D.Vec2())

        this.loop = new RenderLoop({
            timeMultiplier: 0.001,
            maximumTimestep: 0.1
        })
        this.loop.run = (dt: number) => this.renderCards(dt)

        this.containers = []

        this.setupList()
        this.setupScroll()
    }

    setupList() {
        let selectedTank = Number(localStorage.getItem("tanks-selectedtank") || ClientSniperTank.Model.getId());
        let tankExists = false

        for(let tank of ClientTank.Tanks) {
            if(tank.Model.getId() === selectedTank) {
                tankExists = true
                break
            }
        }

        if(!tankExists) {
            selectedTank = ClientSniperTank.Model.getId()
        }

        // Использую forEach здесь, чтобы создать область видимости.
        // В for-in нельзя было бы юзать Tank в асинхронном коде.
        // Пишу это, чтобы будущий я не злился на меня из прошлого,
        // читая этот код. Знай, что переписать танчики стоило
        // примерно месяц времени, там есть на что злиться. Можешь
        // перечитать то что там понаписано, это звездец.
        // Хотя с другой стороны, человек набирает опыт, и, возможно,
        // в будущем я смогу применить более интересные практики для
        // улучшения архитектуры и упрощения кода. Так что если ты
        // взялся переписывать танчики снова, то флаг тебе в руки. Мне
        // очень интересно что ты придумаешь через год-два. Мда. Из
        // обычной пометки этот комментарий превратился в письмо в
        // будущее. Классика.

        let x = 20

        ClientTank.Tanks.forEach((Tank) => {
            let container = new TankSelectElement({
                Tank: Tank,
                previewWorld: this.previewWorld,
                previewCamera: this.previewCamera
            })
            container.setPosition(x)
            container.on("click", () => this.selectTank(container))
            this.container.append(container.element)
            if(Tank.Model.getId() === selectedTank) this.selectTank(container)
            this.containers.push(container)

            x += container.width
        })

        this.updateCards()
    }

    renderCards(dt: number) {
        for(let container of this.containers) {
            if(container.hidden) continue
            container.draw(dt)
        }
    }

    updateCards() {

    }

    selectTank(container: TankSelectElement) {
        const Tank = container.Tank

        this.element.find(".tank-preview-container.selected").removeClass("selected")
        container.element.addClass("selected")

        localStorage.setItem("tanks-selectedtank", String(Tank.Model.getId()))
        this.selectedTank = Tank
        this.emit("select", Tank)
    }

    setupScroll() {
        this.container.on("scroll", () => this.updateShadows())
        this.updateShadows()
        this.updateCards()
    }

    updateShadows() {
        let container = this.container.get(0)
        let leftEdge = container.scrollLeft === 0
        let rightEdge = container.scrollLeft === container.scrollWidth - container.clientWidth

        if(leftEdge && !this.leftShadowHidden) {
            this.leftShadowHidden = true
            this.shadowLeft.css("opacity", "0")
        }

        if(rightEdge && !this.rightShadowHidden) {
            this.rightShadowHidden = true
            this.shadowRight.css("opacity", "0")
        }

        if(!leftEdge && this.leftShadowHidden) {
            this.leftShadowHidden = false
            this.shadowLeft.css("opacity", "1")
        }

        if(!rightEdge && this.rightShadowHidden) {
            this.rightShadowHidden = false
            this.shadowRight.css("opacity", "1")
        }
    }
}