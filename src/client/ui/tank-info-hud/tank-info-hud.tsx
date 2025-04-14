import './tank-info-hud.scss'

import Entity from "src/utils/ecs/entity";
import TrackedTankController from "src/entity/components/tank-controllers/tracked-tank-controller";
import AirbagTankController from "src/entity/components/tank-controllers/airbag-tank-controller";
import WheeledTankController from "src/entity/components/tank-controllers/wheeled-tank-controller";
import TankEngineUnit from "src/entity/components/transmission/units/tank-engine-unit";
import GearboxUnit from "src/entity/components/transmission/units/gearbox-unit";
import HealthComponent from "src/entity/components/health/health-component";
import PhysicalComponent from "src/entity/components/physics-component";
import TankWeaponsController from "src/entity/components/weapon/tank-weapons-controller";
import {
    FirearmWeaponState,
    ChargeWeaponState,
    WeaponComponent,
    WeaponType
} from "src/entity/components/weapon/weapon-component";

import React, { useCallback, useEffect } from 'react';
import TimerComponent from 'src/entity/types/timer/timer-component';
import PrimaryPlayerReceiver from 'src/entity/components/primary-player/primary-player-receiver';

interface TankInfoSpeedViewProps {
    world: Entity
    tank: Entity
}

const TankInfoSpeedView: React.FC<TankInfoSpeedViewProps> = (props) => {

    const [state, setState] = React.useState({
        engine: null as TankEngineUnit | null,
        gearbox: null as GearboxUnit | null,
        gear: null as string | null,
        speed: null as string | null
    })

    const canvasWidth = 120
    const canvasHeight = 60
    const arcWidth = 7
    const scaleBackgroundColor: string = "rgba(0, 0, 0, .05)"
    const scaleColor: string = "#008FCC"

    const canvasRef = React.useRef<HTMLCanvasElement>(null)
    const ctxRef = React.useRef<CanvasRenderingContext2D | null>(null)

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current
            const ratio = window.devicePixelRatio
            canvas.width = canvasWidth * ratio
            canvas.height = canvasHeight * ratio
            const ctx = canvas.getContext("2d")
            if (ctx) {
                ctx.lineWidth = arcWidth
                ctx.scale(ratio, ratio)
                ctxRef.current = ctx
            }
        }
    }, [canvasRef.current])

    const updateRPM = () => {
        const ctx = ctxRef.current
        if (!ctx) return

        ctx.clearRect(0, 0, canvasWidth, canvasHeight)

        let scaleFill = 0

        if (state.engine) {
            let rpm = state.engine.getFlywheelRotationSpeed()
            let maxRpm = state.engine.getMaxRotationSpeed()

            scaleFill = Math.min(1, Math.max(0, rpm / maxRpm))
        }

        ctx.strokeStyle = scaleBackgroundColor
        ctx.beginPath()
        ctx.arc(
            canvasWidth / 2, canvasHeight,
            canvasWidth / 2 - arcWidth / 2,
            Math.PI + Math.PI * scaleFill,
            Math.PI * 2)
        ctx.stroke()

        ctx.strokeStyle = scaleColor
        ctx.beginPath()
        ctx.arc(
            canvasWidth / 2, canvasHeight,
            canvasWidth / 2 - arcWidth / 2,
            Math.PI,
            Math.PI + Math.PI * scaleFill)
        ctx.stroke()

        // let gearboxScaleFill = 0
        // if (gearbox) {
        //     let gbxGearing = gearbox.gears[gearbox.getCurrentGear()].gearing
        //     let gbxRpm = gearbox.transmission.system.qdot[gearbox.outputUnitIndex]
        //
        //     let rpm = Math.abs(gbxRpm * gbxGearing)
        //     let maxRpm = engine.getMaxRotationSpeed()
        //
        //     gearboxScaleFill = Math.min(1, Math.max(0, rpm / maxRpm))
        // }
        //
        // ctx.strokeStyle = "rgba(0, 255, 0, 0.5)"
        // ctx.beginPath()
        // ctx.arc(
        //     canvasWidth / 2, canvasHeight,
        //     canvasWidth / 2 - arcWidth / 2,
        //     Math.PI,
        //     Math.PI + Math.PI * gearboxScaleFill)
        // ctx.stroke()
    }

    const updateSpeed = () => setState((state) => {
        let physicalComponent = props.tank?.getComponent(PhysicalComponent)
        let speedText
        if (!physicalComponent) {
            speedText = "-"
        } else {
            let speed = physicalComponent.getBody().GetLinearVelocity().Length()
            speedText = String(Math.floor(speed * 3.6))
        }
        if (state.speed === speedText) return state
        return { ...state, speed: speedText }
    })

    const updateGear = () => setState((state) => {
        let gearboxString
        if (!state.gearbox) {
            gearboxString = "-"
        } else if (state.gearbox.getShouldReverse()) {
            gearboxString = "R"
        } else {
            gearboxString = String(state.gearbox.getCurrentGear() + 1)
        }
        if (state.gear === gearboxString) return state
        return { ...state, gear: gearboxString }
    })

    const onTick = () => {
        updateSpeed()
        updateRPM()
    }

    useEffect(() => {
        let trackedController = props.tank?.getComponent(TrackedTankController)
        let airbagController = props.tank?.getComponent(AirbagTankController)
        let wheeledController = props.tank?.getComponent(WheeledTankController)

        let engine = null as TankEngineUnit | null
        let gearbox = null as GearboxUnit | null

        if (trackedController) {
            engine = trackedController.engine
            gearbox = trackedController.gearbox
        } else if (airbagController) {
            engine = airbagController.engine
        } else if (wheeledController) {
            engine = wheeledController.engine
            gearbox = wheeledController.gearbox
        }

        setState((state) => ({ ...state, gearbox, engine }))

        updateGear()
        props.tank?.on("gearbox-shift", updateGear)
        return () => props.tank?.off("gearbox-shift", updateGear)
    }, [props.tank])

    useEffect(() => {
        props.world?.on("tick", onTick)
        return () => props.world?.off("tick", onTick)
    }, [props.world, onTick])

    return (
        <div className="tank-info-item speed-info-container">
            <canvas ref={canvasRef} className="rpm-canvas"></canvas>
            <div className="gear-text">{state.gear}</div>
            <div className="speed-text">{state.speed}</div>
            <div className="metric-text">км/ч</div>
        </div>
    )
}

interface TankInfoHealthViewProps {
    tank: Entity
}

const TankInfoHealthView: React.FC<TankInfoHealthViewProps> = (props) => {

    const [state, setState] = React.useState({
        healthFraction: 0
    })

    const updateHealth = () => {
        let healthComponent = props.tank?.getComponent(HealthComponent)
        if (!healthComponent) return
        let healthFraction = healthComponent.getHealth() / healthComponent.getMaxHealth()
        if (state.healthFraction === healthFraction) return
        setState({ healthFraction })
    }

    useEffect(() => {
        updateHealth()
        props.tank?.on("health-set", updateHealth)
        return () => props.tank?.off("health-set", updateHealth)
    }, [props.tank])

    return (
        <div className="tank-info-item health-info-container">
            <div className="health-icon"></div>
            <div className="health-scale">
                <div className="health-scale-filled" style={{ width: (state.healthFraction * 100) + "%" }}></div>
            </div>
        </div>
    )
}

export interface TankInfoWeaponsViewProps {
    tank: Entity
    world: Entity
}

const TankInfoWeaponsView: React.FC<TankInfoWeaponsViewProps> = (props) => {

    const [weapons, setWeapons] = React.useState([] as Entity[])

    const updateWeapons = () => {
        let weaponsController = props.tank?.getComponent(TankWeaponsController)
        if (!weaponsController) return
        let weapons = weaponsController.weapons
        setWeapons([...weapons])
    }

    useEffect(() => {
        updateWeapons()
        props.tank?.on("weapon-attach", updateWeapons)
        props.tank?.on("weapon-detach", updateWeapons)
        return () => {
            props.tank?.off("weapon-attach", updateWeapons)
            props.tank?.off("weapon-detach", updateWeapons)
        }
    }, [props.tank])

    return (
        <div className="tank-weapon-container">
            {weapons.map((weapon, index) => (
                <TankInfoWeaponView key={index} weapon={weapon} world={props.world} />
            ))}
        </div>
    )
}

interface TankInfoWeaponViewProps {
    weapon: Entity
    world: Entity
}

const TankInfoWeaponView: React.FC<TankInfoWeaponViewProps> = (props) => {

    const [state, setState] = React.useState({
        ammoText: null as string | null,
        weaponImage: null as string | null,
        reloadBackgroundHeight: 0
    })

    const formatTime = (time: number) => {
        if (time >= 10) return Math.floor(time).toString()
        if (time >= 1) return time.toFixed(1)
        return time.toFixed(2).slice(1)
    }

    const updateState = useCallback(() => setState((state) => {
        let weaponComponent = props.weapon?.getComponent(WeaponComponent)
        let info = weaponComponent?.info
        let weaponState = weaponComponent?.state

        if (!info || !weaponState) return state

        let fraction = 0
        let text = ""

        if (info.type === WeaponType.firearm) {
            let timer = props.weapon.getComponent(TimerComponent)
            let firearmState = weaponState as FirearmWeaponState

            if (firearmState.isReloading) {
                text = timer ? formatTime(timer.currentTime) : ""
            } else if (firearmState.maxAmmo > 1) {
                text = String(firearmState.currentAmmo)
            }

            if (timer) {
                fraction = timer.originalTime !== 0 ? timer.currentTime / timer.originalTime : 0
            }
        } else {
            let chargeState = weaponState as ChargeWeaponState
            fraction = 1 - chargeState.currentCharge

            if (chargeState.chargingSpeed > 0 && chargeState.currentCharge < 1) {
                text = formatTime(fraction / chargeState.chargingSpeed)
            }
        }

        if (state.ammoText === text && state.reloadBackgroundHeight === fraction) return state

        return { ...state, ammoText: text, reloadBackgroundHeight: fraction }
    }), [props.weapon])

    const updateInfo = useCallback(() =>{
        let weaponComponent = props.weapon?.getComponent(WeaponComponent)
        let info = weaponComponent?.info
        let state = weaponComponent?.state

        if (!info || !state) {
            return
        }

        updateState()
    }, [props.weapon])

    useEffect(() => {
        let info = props.weapon?.getComponent(WeaponComponent)?.info

        if (info) {
            state.weaponImage = "url(\"/static/game/weapon/" + info.id + "@3x.png\")"
        } else {
            state.weaponImage = null
        }

        updateInfo()
    }, [props.weapon])

    useEffect(() => {
        props.world.on("tick", updateState);
        return () => props.world.off("tick", updateState);
    }, [props.world, props.weapon]);

    return (
        <div className="tank-info-item tank-weapon">
            <div className="timer-background" style={{ height: (state.reloadBackgroundHeight * 100).toFixed(2) + "%" }}></div>
            <div className="weapon-icon" style={{ backgroundImage: state.weaponImage }}></div>
            <div className="ammo-text">{state.ammoText}</div>
        </div>
    )
}

interface TankInfoHUDProps {
    world: Entity
}

const TankInfoHUD: React.FC<TankInfoHUDProps> = React.memo((props) => {

    const [state, setState] = React.useState({
        tank: null as Entity | null,
        shown: false
    })

    const updateVisibility = () => {
        setState((state) => {
            const shown = state.tank && state.tank.getComponent(HealthComponent).getHealth() > 0
            if (shown === state.shown) return state
            return { ...state, shown }
        })
    }

    const setTank = (tank: Entity) => {
        setState((state) => ({...state, tank: tank}))
        updateVisibility()
    }

    useEffect(() => {
        let primaryEntity = props.world?.getComponent(PrimaryPlayerReceiver)?.primaryEntity
        setTank(primaryEntity)
        if(!props.world) return undefined

        props.world.on("primary-entity-set", setTank)
        return () => props.world.off("primary-entity-set", setTank)
    }, [props.world])

    useEffect(() => {
        if (!state.tank) return undefined
        state.tank.on("health-set", updateVisibility)
        return () => state.tank.off("health-set", updateVisibility)
    }, [state.tank])

    return (
        <div className="tank-info-hud" style={{ display: state.shown ? undefined : "none" }}>
            <TankInfoSpeedView world={props.world} tank={state.tank} />
            <TankInfoHealthView tank={state.tank} />
            <TankInfoWeaponsView tank={state.tank} world={props.world} />
        </div>
    )
})

export default TankInfoHUD;