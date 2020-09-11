/* @load-resource: './tank-select.scss' */

const View = require("../../../../../ui/view")
const ClientTank = require("../../../../../tanks/clienttank")
const SniperTank = require("../../../../../tanks/models/sniper") // Default selected tank

const TankSelectElement = require("./tankselectelement")
const Camera = require("../../../../../camera")
const Box2D = require("../../../../../../library/box2d")
const RenderLoop = require("../../../../../../utils/loop/renderloop")

class TankSelectContainer extends View {
    constructor() {
        super();

        this.element.addClass("menu tankselect")

        this.shadowLeft = $("<div>").addClass("shadow left");
        this.shadowRight = $("<div>").addClass("shadow right");

        this.container = $("<div>").addClass("tank-select-container")
        this.element.append(this.container, this.shadowLeft, this.shadowRight)

        this.leftShadowHidden = false
        this.rightShadowHidden = false

        this.selectedTank = null

        this.previewCamera = new Camera({
            baseScale: 2,
            viewport: new Box2D.b2Vec2(70, 70),
            defaultPosition: new Box2D.b2Vec2(0, 0),
            inertial: true
        })

        this.previewCamera.tick(0)
        this.previewWorld = new Box2D.b2World(new Box2D.b2Vec2(), true)

        this.loop = new RenderLoop()
        this.loop.run = (dt) => this.renderCards(dt)

        /**
         * @type {TankSelectElement[]}
         */
        this.containers = []

        this.setupList()
        this.setupScroll()
    }

    setupList() {
        let selectedTank = Number(localStorage.getItem("tanks-selectedtank") || SniperTank.getModel().getId());
        let tankExists = false

        for(let tank of ClientTank.Types.values()) {
            if(tank.getModel().getId() === selectedTank) {
                tankExists = true
                break
            }
        }

        if(!tankExists) {
            selectedTank = SniperTank.getModel().getId()
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

        ClientTank.Types.forEach((Tank) => {
            let container = new TankSelectElement({
                Tank: Tank,
                previewWorld: this.previewWorld,
                previewCamera: this.previewCamera
            })
            container.setPosition(x)
            container.on("click", () => this.selectTank(container))
            this.container.append(container.element)
            if(Tank.getModel().getId() === selectedTank) this.selectTank(container)
            this.containers.push(container)

            x += container.width
        })

        this.updateCards()
    }

    renderCards(dt) {
        for(let container of this.containers) {
            if(container.hidden) continue
            container.draw(dt)
        }
    }

    updateCards() {
        let container = this.container.get(0)
        let lowerBound = container.scrollX
        let upperBound = lowerBound + container.clientWidth

        for(let container of this.containers) {
            let offset = container.position

            if(upperBound < offset.x) {
                if(!container.hidden) container.hide()
                continue
            }

            let width = container.width

            if(lowerBound > offset.x + width) {
                if(!container.hidden) container.hide()
                continue
            }

            if(container.hidden) container.show()
        }
    }

    selectTank(container) {
        const Tank = container.Tank

        this.element.find(".tank-preview-container.selected").removeClass("selected")
        container.element.addClass("selected")

        localStorage.setItem("tanks-selectedtank", String(Tank.getModel().getId()))
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

module.exports = TankSelectContainer