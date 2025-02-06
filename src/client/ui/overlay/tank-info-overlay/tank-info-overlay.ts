import './tank-info-overlay.scss'

import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import Entity from "src/utils/ecs/entity";
import View from "src/client/ui/view";
import PrimaryPlayerReceiver from "src/entity/components/network/primary-player/primary-player-receiver";
import TrackedTankController from "src/entity/components/tank-controllers/tracked-tank-controller";
import AirbagTankController from "src/entity/components/tank-controllers/airbag-tank-controller";
import WheeledTankController from "src/entity/components/tank-controllers/wheeled-tank-controller";
import TankEngineUnit from "src/entity/components/transmission/units/tank-engine-unit";
import GearboxUnit from "src/entity/components/transmission/units/gearbox-unit";
import HealthComponent from "src/entity/components/health-component";
import PhysicalComponent from "src/entity/components/physics-component";
import TankWeaponsController from "src/entity/components/weapon/tank-weapons-controller";
import {
    FirearmWeaponState,
    ChargeWeaponState,
    WeaponComponent,
    WeaponType
} from "src/entity/components/weapon/weapon-component";
import TimerComponent from "src/entity/components/network/timer/timer-component";

export class TankInfoSpeedView extends View {
    gearText = $("<div>").addClass("gear-text")
    speedText = $("<div>").addClass("speed-text")
    metricText = $("<div>").addClass("metric-text")
    rpmCanvas = $("<canvas>").addClass("rpm-canvas")

    ctx: CanvasRenderingContext2D | null = null

    private canvasWidth = 120
    private canvasHeight = 60
    private arcWidth = 7
    private scaleBackgroundColor: string = "rgba(0, 0, 0, .05)"
    private scaleColor: string = "#008FCC"

    private tank: Entity | null = null
    private engine: TankEngineUnit | null = null
    private gearbox: GearboxUnit | null = null

    private tankEventHandler = new BasicEventHandlerSet()

    constructor() {
        super()
        this.element.append(this.rpmCanvas)
        this.element.append(this.gearText)
        this.element.append(this.speedText)
        this.element.append(this.metricText)

        this.metricText.text("км/ч")

        this.element.addClass("tank-info-item")
        this.element.addClass("speed-info-container")

        let canvas = this.rpmCanvas[0] as HTMLCanvasElement
        let ratio = window.devicePixelRatio
        canvas.width = this.canvasWidth * ratio
        canvas.height = this.canvasHeight * ratio
        this.ctx = canvas.getContext("2d")
        this.ctx.lineWidth = this.arcWidth
        this.ctx.scale(ratio, ratio)

        this.tankEventHandler.on("gearbox-shift", () => this.updateGear())
    }

    setEngine(engine: TankEngineUnit) {
        this.engine = engine
        this.updateRPM()
    }

    setGearbox(gearbox: GearboxUnit) {
        this.gearbox = gearbox
        this.updateGear()
    }

    onTick() {
        this.updateRPM()
        this.updateSpeed()
    }

    setTank(tank: Entity) {
        this.tank = tank
        this.tankEventHandler.setTarget(this.tank)

        let trackedController = tank?.getComponent(TrackedTankController)
        let airbagController = tank?.getComponent(AirbagTankController)
        let wheeledController = tank?.getComponent(WheeledTankController)

        if (trackedController) {
            this.setEngine(trackedController.engine)
            this.setGearbox(trackedController.gearbox)
        } else if (airbagController) {
            this.setEngine(airbagController.engine)
            this.setGearbox(null)
        } else if (wheeledController) {
            this.setEngine(wheeledController.engine)
            this.setGearbox(wheeledController.gearbox)
        } else {
            this.setEngine(null)
            this.setGearbox(null)
        }

        this.updateGear()
    }

    private updateGear() {

        let gearboxString
        if (!this.gearbox) {
            gearboxString = "-"
        } else if (this.gearbox.getShouldReverse()) {
            gearboxString = "R"
        } else {
            gearboxString = String(this.gearbox.getCurrentGear() + 1)
        }
        this.gearText.text(gearboxString)
    }

    private updateRPM() {
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)

        let scaleFill = 0

        if (this.engine) {
            let rpm = this.engine.getFlywheelRotationSpeed()
            let maxRpm = this.engine.getMaxRotationSpeed()

            scaleFill = Math.min(1, Math.max(0, rpm / maxRpm))
        }

        this.ctx.strokeStyle = this.scaleBackgroundColor
        this.ctx.beginPath()
        this.ctx.arc(
            this.canvasWidth / 2, this.canvasHeight,
            this.canvasWidth / 2 - this.arcWidth / 2,
            Math.PI + Math.PI * scaleFill,
            Math.PI * 2)
        this.ctx.stroke()

        this.ctx.strokeStyle = this.scaleColor
        this.ctx.beginPath()
        this.ctx.arc(
            this.canvasWidth / 2, this.canvasHeight,
            this.canvasWidth / 2 - this.arcWidth / 2,
            Math.PI,
            Math.PI + Math.PI * scaleFill)
        this.ctx.stroke()

        // let gearboxScaleFill = 0
        // if (this.gearbox) {
        //     let gbxGearing = this.gearbox.gears[this.gearbox.getCurrentGear()].gearing
        //     let gbxRpm = this.gearbox.transmission.system.qdot[this.gearbox.outputUnitIndex]
        //
        //     let rpm = Math.abs(gbxRpm * gbxGearing)
        //     let maxRpm = this.engine.getMaxRotationSpeed()
        //
        //     gearboxScaleFill = Math.min(1, Math.max(0, rpm / maxRpm))
        // }
        //
        // this.ctx.strokeStyle = "rgba(0, 255, 0, 0.5)"
        // this.ctx.beginPath()
        // this.ctx.arc(
        //     this.canvasWidth / 2, this.canvasHeight,
        //     this.canvasWidth / 2 - this.arcWidth / 2,
        //     Math.PI,
        //     Math.PI + Math.PI * gearboxScaleFill)
        // this.ctx.stroke()

    }

    private updateSpeed() {
        let physicalComponent = this.tank?.getComponent(PhysicalComponent)
        if (!physicalComponent) {
            this.speedText.text("-")
        } else {
            let speed = physicalComponent.getBody().GetLinearVelocity().Length()
            this.speedText.text(String(Math.floor(speed * 3.6)))
        }
    }
}

export class TankInfoHealthView extends View {

    healthRow = $("<div>").addClass("health-row")
    healthIcon = $("<div>").addClass("health-icon")
    healthScale = $("<div>").addClass("health-scale")
    healthScaleFilled = $("<div>").addClass("health-scale-filled")

    private tank: Entity
    private tankEventHandler = new BasicEventHandlerSet()

    constructor() {
        super()
        this.element.addClass("tank-info-item")
        this.element.addClass("health-info-container")

        this.healthScale.append(this.healthScaleFilled)
        this.element.append(this.healthIcon, this.healthScale)

        this.tankEventHandler.on("health-set", () => this.updateHealth())
    }

    private updateHealth() {
        let healthComponent = this.tank?.getComponent(HealthComponent)

        if (!healthComponent) {
            this.healthRow.hide()
            return
        } else {
            this.healthRow.show()
        }

        let healthFraction = healthComponent.getHealth() / healthComponent.getMaxHealth() * 100

        this.healthScaleFilled.css("width", healthFraction.toFixed(1) + "%")
    }

    setTank(tank: Entity) {
        this.tank = tank
        this.tankEventHandler.setTarget(this.tank)
        this.updateHealth()
    }
}

export class TankInfoWeaponsView extends View {

    weaponViews: TankInfoWeaponView[] = []
    tankEventHandler = new BasicEventHandlerSet()
    tank: Entity | null = null

    constructor() {
        super();

        this.element.addClass("tank-weapon-container")

        this.tankEventHandler.on("weapon-attach", () => this.updateWeapons())
        this.tankEventHandler.on("weapon-detach", () => this.updateWeapons())
    }

    getWeaponArray() {
        let weaponsController = this.tank?.getComponent(TankWeaponsController)
        return weaponsController?.weapons ?? []
    }

    updateWeapons() {
        let weapons = this.getWeaponArray()

        while (this.weaponViews.length > weapons.length) {
            let lastView = this.weaponViews.pop()
            lastView.setWeapon(null)
            lastView.element.remove()
        }

        while (this.weaponViews.length < weapons.length) {
            let newView = new TankInfoWeaponView()
            this.weaponViews.push(newView)
            this.element.append(newView.element)
        }

        for (let i = 0; i < weapons.length; i++) {
            this.weaponViews[i].setWeapon(weapons[i])
        }
    }

    setTank(tank: Entity) {
        this.tankEventHandler.setTarget(tank)
        this.tank = tank
        this.updateWeapons()
    }

    onTick() {
        for (let view of this.weaponViews) {
            view.updateState()
        }
    }
}

export class TankInfoWeaponView extends View {

    ammoText = $("<div>").addClass("ammo-text")
    reloadBackground = $("<div>").addClass("timer-background")
    weaponIcon = $("<div>").addClass("weapon-icon")

    private weapon: Entity | null = null
    private weaponEventHandler = new BasicEventHandlerSet()

    constructor() {
        super();

        this.element.addClass("tank-info-item")
        this.element.addClass("tank-weapon")

        this.element.append(this.reloadBackground)
        this.element.append(this.weaponIcon)
        this.element.append(this.ammoText)

        this.weaponEventHandler.on("weapon-state-update", () => this.updateInfo())
        this.weaponEventHandler.on("weapon-info-update", () => this.updateInfo())
    }

    private formatTime(time: number) {
        if (time >= 10) return Math.floor(time).toString()
        if (time >= 1) return time.toFixed(1)
        return time.toFixed(2).slice(1)
    }

    updateState() {
        let weaponComponent = this.weapon?.getComponent(WeaponComponent)
        let info = weaponComponent?.info
        let state = weaponComponent?.state

        if (!info || !state) return;

        let fraction = 0
        let text = ""

        if (info.type === WeaponType.firearm) {
            let timer = this.weapon.getComponent(TimerComponent)
            let firearmState = state as FirearmWeaponState

            if (firearmState.isReloading) {
                text = timer ? this.formatTime(timer.currentTime) : ""
            } else if (firearmState.maxAmmo > 1) {
                text = String(firearmState.currentAmmo)
            }

            if (timer) {
                fraction = timer.originalTime !== 0 ? timer.currentTime / timer.originalTime : 0
            }
        } else {
            let chargeState = state as ChargeWeaponState
            fraction = 1 - chargeState.currentCharge

            if (chargeState.chargingSpeed > 0 && chargeState.currentCharge < 1) {
                text = this.formatTime(fraction / chargeState.chargingSpeed)
            }
        }

        this.ammoText.text(text)
        this.reloadBackground.css("height", (fraction * 100).toFixed(2) + "%")
    }

    updateInfo() {
        let weaponComponent = this.weapon?.getComponent(WeaponComponent)
        let info = weaponComponent?.info
        let state = weaponComponent?.state

        if (!info || !state) {
            this.element.hide()
        } else {
            this.element.show()
        }

        this.updateState()
    }

    setWeapon(weapon: Entity | null) {
        this.weapon = weapon
        this.weaponEventHandler.setTarget(this.weapon)

        let timer = this.weapon?.getComponent(TimerComponent)
        let info = this.weapon?.getComponent(WeaponComponent)?.info

        if (info) {
            this.weaponIcon.css("background-image", "url(\"static/game/weapon/" + info.id + "@3x.png\")")
        } else {
            this.weaponIcon.css("background-image", null)
        }

        this.updateInfo()
    }
}

export default class TankInfoOverlay extends View {

    worldEventHandler = new BasicEventHandlerSet()
    world: Entity | null = null

    speedInfoContainer = new TankInfoSpeedView()
    ammoInfoContainer = new TankInfoHealthView()
    weaponsContainer = new TankInfoWeaponsView()

    tank: Entity
    visible: boolean = true

    constructor() {
        super();

        this.element.addClass("tank-info-overlay")

        this.element.append(this.speedInfoContainer.element)
        this.element.append(this.ammoInfoContainer.element)
        this.element.append(this.weaponsContainer.element)

        this.worldEventHandler.on("primary-entity-set", (entity) => {
            this.setPrimaryEntity(entity)
        })

        this.worldEventHandler.on("tick", () => {
            this.onTick()
        })
    }

    setGameWorld(world: Entity) {
        this.world = world
        this.worldEventHandler.setTarget(this.world)
        this.setPrimaryEntity(this.world?.getComponent(PrimaryPlayerReceiver)?.primaryEntity)
    }

    setPrimaryEntity(entity: Entity) {
        this.tank = entity
        this.speedInfoContainer.setTank(entity)
        this.ammoInfoContainer.setTank(entity)
        this.weaponsContainer.setTank(entity)

        this.updateVisibility()
    }

    onTick() {
        this.speedInfoContainer.onTick()
        this.weaponsContainer.onTick()

        this.updateVisibility()
    }

    private updateVisibility() {
        let isVisible = this.tank && this.tank.getComponent(HealthComponent).getHealth() > 0

        if (isVisible === this.visible) return;

        if (isVisible) {
            this.element.show()
        } else {
            this.element.hide()
        }

        this.visible = isVisible;
    }
}