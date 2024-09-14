/* @load-resource: './tank-select-overlay.scss' */

import RootControlsResponder, {ControlsResponder} from "src/client/controls/root-controls-responder";
import RenderLoop from "src/utils/loop/render-loop";
import TankSelectCarousel from "src/client/ui/overlay/tank-select-overlay/carousel/tank-select-carousel";
import TankCarouselButton from "src/client/ui/overlay/tank-select-overlay/carousel/tank-carousel-button";
import TankStatRow from "src/client/ui/overlay/tank-select-overlay/tank-stat-row";
import {TankStats} from "src/stat-tests/tank-stats";
import Overlay from "src/client/ui/overlay/overlay";

export interface TankSelectOverlayConfig {
    gameControls: ControlsResponder
}

export default class TankSelectOverlay extends Overlay {

    // jquery elements
    private menu = $("<div>").addClass("tank-select-menu")
    private titleContainer = $("<div>").addClass("tank-title-container")
    private title = $("<div>").addClass("tank-title")
    private carousel = new TankSelectCarousel()
    private carouselLeftButton = new TankCarouselButton().left()
    private carouselRightButton = new TankCarouselButton().right()
    private descriptionMenu = $("<div>").addClass("tank-description-menu")
    private descriptionText = $("<div>").addClass("tank-description-text")
    private descriptionStats = $("<div>").addClass("tank-description-stats")

    private speedStat = new TankStatRow().setLabel("СКР").setMedianStatValue(TankStats.median.speed)
    private attackStat = new TankStatRow().setLabel("АТК").setMedianStatValue(TankStats.median.damage)
    private defenceStat = new TankStatRow().setLabel("ЗАЩ").setMedianStatValue(TankStats.median.health)

    private controlsResponder = new ControlsResponder()
    private gameControlsResponder = new ControlsResponder()
    private animationLoop: RenderLoop
    private tankSelectionRequired = false

    constructor(options: TankSelectOverlayConfig) {
        super()
        this.element.addClass("tank-select-overlay")

        this.gameControlsResponder = options.gameControls

        this.menu.append(this.carousel.element)
        this.titleContainer.append(this.title)
        this.titleContainer.append(this.carouselLeftButton.element)
        this.titleContainer.append(this.carouselRightButton.element)
        this.menu.append(this.titleContainer)
        this.descriptionMenu.append(this.descriptionText)
        this.descriptionMenu.append(this.descriptionStats)
        this.menu.append(this.descriptionMenu)
        this.element.append(this.menu)

        this.descriptionStats.append(this.speedStat.element)
        this.descriptionStats.append(this.attackStat.element)
        this.descriptionStats.append(this.defenceStat.element)

        this.animationLoop = new RenderLoop({
            timeMultiplier: 0.001,
            maximumTimestep: 0.1
        })

        this.animationLoop.run = (dt) => this.onFrame(dt)

        this.controlsResponder.on("navigate-left", () => this.onNavigateLeft())
        this.carouselLeftButton.element.on("click", () => this.onNavigateLeft())

        this.controlsResponder.on("navigate-right", () => this.onNavigateRight())
        this.carouselRightButton.element.on("click", () => this.onNavigateRight())

        this.controlsResponder.on("game-change-tank", () => this.onClose())
        this.controlsResponder.on("navigate-back", () => this.onClose())

        this.controlsResponder.on("confirm", () => this.onConfirm())
        this.controlsResponder.on("game-change-tank", () => this.hide())
        this.carousel.on("confirm", () => this.onConfirm())

        this.carousel.on("move", () => this.onCarouselMove())

        this.gameControlsResponder.on("game-change-tank", () => this.show())

        this.onCarouselMove()
    }

    private onFrame(dt: number) {
        this.carousel.onFrame(dt)
    }

    private onCarouselMove() {
        let nearTank = this.carousel.getNearTank()
        this.title.text(nearTank.name)
        this.descriptionText.text(nearTank.description)

        const nearTankStats = TankStats.stats[nearTank.type]

        let farTank = this.carousel.getFarTank()
        let nearTankDistance = this.carousel.indexDistanceToNearestTank()
        let farTankStats = TankStats.stats[farTank.type]

        this.speedStat.setValue(nearTankStats.speed * (1 - nearTankDistance) + farTankStats.speed * nearTankDistance)
        this.attackStat.setValue(nearTankStats.damage * (1 - nearTankDistance) + farTankStats.damage * nearTankDistance)
        this.defenceStat.setValue(nearTankStats.health * (1 - nearTankDistance) + farTankStats.health * nearTankDistance)
    }

    show() {
        if (super.show()) {
            RootControlsResponder.getInstance().setMainResponderDelayed(this.controlsResponder)
            this.animationLoop.start()
            this.carousel.layout()
            return true
        }
        return false;
    }

    hide() {
        if (super.hide()) {
            RootControlsResponder.getInstance().setMainResponderDelayed(this.gameControlsResponder)
            this.animationLoop.stop()
            return true
        }
        return false
    }

    private onNavigateLeft() {
        this.carousel.targetCenterIndex--
        this.carouselLeftButton.trigger()
    }

    private onNavigateRight() {
        this.carousel.targetCenterIndex++
        this.carouselRightButton.trigger()
    }

    private onConfirm() {
        this.tankSelectionRequired = false
        this.emit("confirm", this.carousel.getNearTank().type)
        this.hide()
    }

    requireTankSelection() {
        this.tankSelectionRequired = true
    }

    private onClose() {
        if (this.tankSelectionRequired) {
            return
        }
        this.emit("close")
    }
}