import './tank-select-overlay.scss'

import RootControlsResponder, {ControlsResponder} from "src/client/controls/root-controls-responder";
import RenderLoop from "src/utils/loop/render-loop";
import {TankStat, TankStats} from "src/stat-tests/tank-stats";
import { Ref, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import React from 'react';
import { TankDescription, tankDescriptions } from './tank-descriptions';
import CarouselController, { CarouselConfig, CarouselItem } from '../carousel/carousel-controller';
import { ControlsProvider, useControls } from 'src/client/utils/react-controls-responder';

const getTankForIndex = (item: number) => {
    let tankIndex = item % tankDescriptions.length
    if (tankIndex < 0) tankIndex += tankDescriptions.length
    return tankDescriptions[tankIndex]
}

const getNearIndex = (index: number) => {
    return Math.round(index)
}

const getFarIndex = (index: number) =>  {
    let rounded = Math.round(index)
    if (index - rounded > 0) {
        return rounded + 1
    } else {
        return rounded - 1
    }
}

const getFarWeight = (index: number) => {
    return Math.abs(index - Math.round(index))
}

interface TankCarouselConfig extends CarouselConfig {
    radius: number
    angle: number
    width: number
}

interface TankSelectCarouselItemProps {
    item: CarouselItem
    carouselConfig: TankCarouselConfig
    onClick: (index: number) => void
}

const TankSelectCarouselItem: React.FC<TankSelectCarouselItemProps> = (props) => {
    const ref = React.useRef<HTMLDivElement>(null)

    const selfWidth = 146 // TODO: hardcode?

    const opacityFunction = (distance: number) => {
        return Math.max((1 - distance) / (1 + distance), 0)
    }

    const scaleFunction = (distance: number) => {
        return 1 - (1 - opacityFunction(distance)) * 0.5
    }

    useEffect(() => {
        if (!ref.current) return

        let item = ref.current

        const carouselRadius = props.carouselConfig.radius
        const carouselWidth = props.carouselConfig.width
        const carouselAngle = props.carouselConfig.angle
        const carouselVisibleItems = props.carouselConfig.visibleItems

        let angle = props.item.position * carouselAngle
        let angleLimit = carouselVisibleItems * carouselAngle * 0.5

        let offsetX = Math.sin(angle) * carouselRadius;
        let offsetY = -Math.cos(angle) * carouselRadius + carouselRadius;

        let left = offsetX + carouselWidth / 2 - selfWidth / 2;
        let top = offsetY

        let distance = Math.min(Math.abs(angle) / angleLimit, 1)

        let opacity = opacityFunction(distance)
        let scale = scaleFunction(distance)

        item.style.left = left + "px"
        item.style.top = top + "px"
        item.style.transform = "scale(" + scale + ", " + scale + ") rotate(" + angle + "rad)"
        item.style.opacity = (opacity * 100).toFixed(2) + "%"
    }, [props.item, props.carouselConfig])

    const onClick = useCallback(() => {
        props.onClick(props.item.index)
    }, [props.onClick, props.item])

    return (
        <div ref={ref} onClick={onClick} className="tank-select-carousel-item">
            { 
                /* TODO: add canvas and stuff */
            }
        </div>
    )
}

interface TankSelectCarouselProps {
    onClick: (index: number) => void
    centerIndex: number
}

const TankSelectCarousel: React.FC<TankSelectCarouselProps> = (props) => {

    const carouselConfig: TankCarouselConfig = {
        radius: 800,
        angle: 15 / 180 * Math.PI,
        width: 860,
        visibleItems: 5,
        centerIndex: props.centerIndex
    }

    const [state, setState] = React.useState({
        carouselController: React.useMemo(() => new CarouselController(carouselConfig), [])
    })

    useEffect(() => {
        state.carouselController.setCenterIndex(props.centerIndex)
    }, [props.centerIndex])

    return (
        <div className="tank-select-carousel">
            {state.carouselController.getItems().map((item, index) => (
                <TankSelectCarouselItem
                    onClick={props.onClick}
                    key={index}
                    carouselConfig={carouselConfig}
                    item={{ ...item }} />
            ))}
        </div>
    );
}

interface TankStatRowProps {
    label: string
    value: number
    medianStatValue: number
}

const TankStatRow: React.FC<TankStatRowProps> = (props) => {

    const formatNumber= (number: number) => {
        if(number < 0.01) return 0
        if(number < 0.1) return number.toFixed(2)
        if(number < 100) return number.toPrecision(2)
        return Math.round(number).toString()
    }

    return (
        <div className="tank-stat-row">
            <div className="tank-stat-label">{props.label}</div>
            <div className="tank-stat-scale">
                <div className="tank-stat-scale-bar" style={{width: (props.value / (props.value + props.medianStatValue)) * 100 + "%"}}></div>
            </div>
            <div className="tank-stat-value">{formatNumber(props.value)}</div>
        </div>
    )
}

interface TankCarouselButtonProps {
    left?: boolean
    right?: boolean
    animationTrigger?: {} | null
    onClick?: () => void
}

const TankCarouselButton: React.FC<TankCarouselButtonProps> = (props) => {
 
    let classNames = ["tank-carousel-button"]
    if (props.left) classNames.push("tank-carousel-button-left")
    if (props.right) classNames.push("tank-carousel-button-right")

    let [triggered, setTriggered] = useState<boolean>(false)

    useEffect(() => {
        if(!props.animationTrigger || triggered) return () => {}

        setTriggered(true)
        let timeout = window.setTimeout(() => {
            setTriggered(false)
        }, 200)

        return () => {
            clearTimeout(timeout)
            setTriggered(false)
        }
    }, [props.animationTrigger])
    
    if (triggered) classNames.push("tank-carousel-button-active")

    return (
        <div onClick={props.onClick} className={classNames.join(" ")}></div>
    )
}

export interface TankSelectOverlayHandle {
    show: () => void
}

export interface TankSelectOverlayProps {
    onTankSelect: (tankType: number) => void
    ref?: Ref<TankSelectOverlayHandle>
}

const TankSelectOverlay: React.FC<TankSelectOverlayProps> = React.memo((props) => {
    const [state, setState] = useState({
        shown: false,
        required: false,
        targetCarouselCenterIndex: 0,
        carouselCenterIndex: 0,
        leftAnimationTrigger: null as {} | null,
        rightAnimationTrigger: null as {} | null,
        tankDescription: null as TankDescription | null,
        tankStats: {
            speed: 0,
            damage: 0,
            health: 0
        } as TankStat,
        animationLoop: useMemo(() => new RenderLoop({
            timeMultiplier: 0.001,
            maximumTimestep: 0.1
        }), []),
    })

    const gameControls = useControls()
    const controlsResponderRef = useRef<ControlsResponder | null>(null)

    useImperativeHandle(props.ref, () => {
        return {
            show: () => {
                setState(state => ({ ...state, shown: true, required: true }))
            }
        }
    })

    const toggleVisibility = useCallback(() => {
        setState((state) => {
            if(state.required) return state
            return {
                ...state,
                shown: !state.shown,
                required: false 
            }
        })
    }, [])
    
    const onNavigateLeft = useCallback(() => {
        setState((state) => ({
            ...state,
            leftAnimationTrigger: {},
            targetCarouselCenterIndex: state.targetCarouselCenterIndex - 1
        }))
    }, [])

    const onNavigateRight = useCallback(() => {
        setState((state) => ({
            ...state,
            rightAnimationTrigger: {},
            targetCarouselCenterIndex: state.targetCarouselCenterIndex + 1
        }))
    }, [])

    const onConfirm = useCallback(() => {
        setState((state) => {
            let nearTankIndex = getNearIndex(state.carouselCenterIndex)
            let nearTank = getTankForIndex(nearTankIndex)
            props.onTankSelect(nearTank.type)
            return {
                ...state,
                shown: false,
                required: false
            }
        })
    }, [])

    const onFrame = useCallback((dt: number) => setState((state) => {
        let delta = state.targetCarouselCenterIndex - state.carouselCenterIndex

        if(delta === 0) {
            return state
        }

        let newPosition
        if (Math.abs(delta) < 0.001) {
            newPosition = state.targetCarouselCenterIndex
        } else {
            let animationStep = delta - delta * Math.exp(-dt * 15)
            newPosition = state.carouselCenterIndex + animationStep
        }

        return { ...state, carouselCenterIndex: newPosition }
    }), [])

    const onCarouselClick = useCallback((index: number) => {
        setState((state) => {
            if(state.targetCarouselCenterIndex === index) {
                props.onTankSelect(index)
                return state
            }

            return {
                ...state,
                targetCarouselCenterIndex: index
            }
        })
    }, [])

    useEffect(() => {
        state.animationLoop.run = onFrame

        controlsResponderRef.current.on("game-change-tank", toggleVisibility)
        controlsResponderRef.current.on("navigate-left", onNavigateLeft)
        controlsResponderRef.current.on("navigate-right", onNavigateRight)
        controlsResponderRef.current.on("confirm", onConfirm)
        controlsResponderRef.current.on("navigate-back", toggleVisibility)
    }, [])

    useEffect(() => {
        if(!gameControls) return undefined
        gameControls.on("game-change-tank", toggleVisibility)
        return () => gameControls.off("game-change-tank", toggleVisibility)
    }, [gameControls])

    useEffect(() => {   
        if(!state.shown) return undefined
        state.animationLoop.start()
        return () => state.animationLoop.stop()
    }, [state.shown])

    useEffect(() => {
        let nearTankIndex = getNearIndex(state.carouselCenterIndex)
        let farTankIndex = getFarIndex(state.carouselCenterIndex)
        let farWeight = getFarWeight(state.carouselCenterIndex)
        let nearWeight = 1 - farWeight
        let nearTank = getTankForIndex(nearTankIndex)
        let farTank = getTankForIndex(farTankIndex)
        
        let nearStat = TankStats.stats[nearTank.type]
        let farStat = TankStats.stats[farTank.type]
        
        setState((state) => ({
            ...state,
            tankDescription: nearTank,
            tankStats: {
                speed: nearStat.speed * nearWeight + farStat.speed * farWeight,
                damage: nearStat.damage * nearWeight + farStat.damage * farWeight,
                health: nearStat.health * nearWeight + farStat.health * farWeight
            }
        }))
    }, [state.carouselCenterIndex])

    return  (
        <ControlsProvider ref={controlsResponderRef} enabled={state.shown}>
            <div className="tank-select-overlay" style={{display: state.shown ? undefined : "none"}}>
                <div className="tank-select-menu">
                    <TankSelectCarousel centerIndex={state.carouselCenterIndex} onClick={onCarouselClick}/>
                    <div className="tank-title-container">
                        <div className="tank-title">{state.tankDescription?.name}</div>
                        <TankCarouselButton left
                            animationTrigger={state.leftAnimationTrigger}
                            onClick={onNavigateLeft}/>
                        <TankCarouselButton right
                            animationTrigger={state.rightAnimationTrigger}
                            onClick={onNavigateRight}/>
                    </div>
                    <div className="tank-description-menu">
                        <div className="tank-description-text">{state.tankDescription?.description}</div>
                        <div className="tank-description-stats">
                            <TankStatRow label="СКР" value={state.tankStats.speed} medianStatValue={TankStats.median.speed}/>
                            <TankStatRow label="АТК" value={state.tankStats.damage} medianStatValue={TankStats.median.damage}/>
                            <TankStatRow label="ЗАЩ" value={state.tankStats.health} medianStatValue={TankStats.median.health}/>
                        </div>
                    </div>
                </div>
            </div>
        </ControlsProvider>
    )
})

export default TankSelectOverlay