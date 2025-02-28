import './tank-select-overlay.scss'

import {ControlsResponder} from "src/client/controls/root-controls-responder";
import {TankStats} from "src/stat-tests/tank-stats";
import React, { createContext, Ref, RefObject, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { TankDescription, tankDescriptions } from './tank-descriptions';
import CarouselController, { CarouselConfig, CarouselItem } from '../carousel/carousel-controller';
import { ControlsProvider, useControls } from 'src/client/utils/react-controls-responder';
import TankPreviewCanvas from './tank-preview-canvas';
import CanvasHandler from 'src/client/graphics/canvas-handler';
import Sprite from 'src/client/graphics/sprite';
import { useScene } from 'src/client/scenes/scene-controller';
import AdapterLoop from 'src/utils/loop/adapter-loop';
import EventEmitter from 'src/utils/event-emitter';
import { availableFeatures } from 'src/client/utils/browsercheck/browser-check';

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

interface TankSelectCarouselItemHandle {
    updatePosition: (items: CarouselItem[]) => void
}

interface TankSelectCarouselItemProps {
    carouselConfig: TankCarouselConfig
    onClick: (index: number) => void,
    ref: Ref<TankSelectCarouselItemHandle>,
    index: number
}

const TankSelectCarouselItem: React.FC<TankSelectCarouselItemProps> = (props) => {
    const ref = React.useRef<HTMLDivElement>(null)

    const [tankType, setTankType] = useState<number | null>(null)

    const selfWidth = 146 // TODO: hardcode?

    const opacityFunction = (distance: number) => {
        return Math.max((1 - distance) / (1 + distance), 0)
    }

    const scaleFunction = (distance: number) => {
        return 1 - (1 - opacityFunction(distance)) * 0.5
    }

    useImperativeHandle(props.ref, () => ({
        updatePosition: (items: CarouselItem[]) => {
            let item = items[props.index]
            const carouselRadius = props.carouselConfig.radius
            const carouselWidth = props.carouselConfig.width
            const carouselAngle = props.carouselConfig.angle
            const carouselVisibleItems = props.carouselConfig.visibleItems

            let angle = item.position * carouselAngle
            let angleLimit = carouselVisibleItems * carouselAngle * 0.5

            let offsetX = Math.sin(angle) * carouselRadius;
            let offsetY = -Math.cos(angle) * carouselRadius + carouselRadius;

            let left = offsetX + carouselWidth / 2 - selfWidth / 2;
            let top = offsetY

            let distance = Math.min(Math.abs(angle) / angleLimit, 1)

            let opacity = opacityFunction(distance)
            let scale = scaleFunction(distance)

            let div = ref.current
            div.style.left = left + "px"
            div.style.top = top + "px"
            div.style.transform = "scale(" + scale + ", " + scale + ") rotate(" + angle + "rad)"
            div.style.opacity = (opacity * 100).toFixed(2) + "%"

            let tankIndex = item.index % tankDescriptions.length
            if (tankIndex < 0) tankIndex += tankDescriptions.length
            setTankType(tankDescriptions[tankIndex].type)
        }
    }), [props.index])

    const onClick = useCallback(() => {
        props.onClick(props.index)
    }, [props.onClick, props.index])

    return (
        <div ref={ref} onClick={onClick} className="tank-select-carousel-item">
            <TankPreviewCanvas tankType={tankType}/>
        </div>
    )
}

interface TankSelectCarouselContextProps {
    canvas: CanvasHandler
    ticker: EventEmitter
}

export const TankSelectCarouselContext = createContext<TankSelectCarouselContextProps | null>(null)

interface TankSelectCarouselDrawerProps {
    children: React.ReactNode,
    enabled: boolean
}

const TankSelectCarouselDrawer: React.FC<TankSelectCarouselDrawerProps> = (props) => {

    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const useOffscreenCanvas = availableFeatures.OffscreenCanvas === true
    const scene = useScene()
    
    const [context, setContext] = useState<TankSelectCarouselContextProps>({
        canvas: null,
        ticker: null
    })

    const onFrame = useCallback((dt: number) => {
        context.ticker?.emit("tick", dt)
    }, [context.ticker])

    useEffect(() => {
        let canvas: HTMLCanvasElement | OffscreenCanvas
        let scale = window.devicePixelRatio ?? 1
        let width = 146, height = 139
        if(useOffscreenCanvas) {
            canvas = new OffscreenCanvas(width * scale, height * scale)
        } else {
            canvas = canvasRef.current
            canvas.width = width * scale
            canvas.height = height * scale
        }

        let handler = new CanvasHandler(canvas)
        let texture = Sprite.applyTexture(handler.ctx)
        setContext({ canvas: handler, ticker: new EventEmitter() })
        handler.setSize(width, height)

        return () => Sprite.cleanupTexture(handler.ctx, texture)
    }, [])

    useEffect(() => {
        if(!props.enabled) return undefined
        scene.loop.on("tick", onFrame)
        return () => scene.loop.off("tick", onFrame)
    }, [props.enabled, onFrame])

    return (<>
        {
            useOffscreenCanvas ? null : <canvas style={{visibility: "hidden"}} ref={canvasRef}></canvas>
        }
        {
            context.canvas ? <TankSelectCarouselContext.Provider value={context} children={props.children}/> : null
        }
    </>)
}

interface TankSelectCarouselHandle {
    setPosition: (position: number) => void
    getPosition: () => number
}

interface TankSelectCarouselProps {
    onClick: (index: number) => void
    initialPosition: number,
    shown: boolean,
    ref: Ref<TankSelectCarouselHandle>
}

const TankSelectCarousel: React.FC<TankSelectCarouselProps> = React.memo((props) => {

    const carouselConfig: TankCarouselConfig = useMemo(() => ({
        radius: 800,
        angle: 15 / 180 * Math.PI,
        width: 860,
        visibleItems: 5,
        initialPosition: props.initialPosition
    }), [])

    const [state, setState] = useState({
        carouselController: React.useMemo(() => new CarouselController(carouselConfig), [])
    })

    const refs = (() => {
        let result: RefObject<TankSelectCarouselItemHandle | null>[] = []
        for (let i = 0; i < tankDescriptions.length; i++) {
            result.push(useRef(null))
        }
        return result
    })()

    useImperativeHandle(props.ref, () => ({
        setPosition: (position: number) => {
            state.carouselController.setCenterIndex(position)
            refs.forEach((ref) => ref.current?.updatePosition(state.carouselController.getItems()))
        },
        getPosition: () => {
            return state.carouselController.centerIndex
        }
    }), [state.carouselController])

    return (
        <TankSelectCarouselDrawer enabled={props.shown}>
            <div className="tank-select-carousel">
                {state.carouselController.getItems().map((item, index) => (
                    <TankSelectCarouselItem
                        ref={refs[index]}
                        onClick={props.onClick}
                        key={index}
                        index={index}
                        carouselConfig={carouselConfig}
                        />
                ))}
            </div>
        </TankSelectCarouselDrawer>
    );
})

interface TankStatRowHandle {
    setValue: (value: number) => void
}

interface TankStatRowProps {
    label: string
    medianStatValue: number,
    ref: Ref<TankStatRowHandle>
}

const TankStatRow: React.FC<TankStatRowProps> = (props) => {

    const barRef = useRef<HTMLDivElement>(null)
    const valueRef = useRef<HTMLDivElement>(null)

    const formatNumber = (number: number) => {
        if(number < 0.01) return "0"
        if(number < 0.1) return number.toFixed(2)
        if(number < 100) return number.toPrecision(2)
        return Math.round(number).toString()
    }

    useImperativeHandle(props.ref, () => ({
        setValue: (value: number) => {
            barRef.current.style.width = (value / (value + props.medianStatValue)) * 100 + "%"
            valueRef.current.innerText = formatNumber(value)
        }
    }), [])

    return (
        <div className="tank-stat-row">
            <div className="tank-stat-label">{props.label}</div>
            <div className="tank-stat-scale">
                <div className="tank-stat-scale-bar" ref={barRef}></div>
            </div>
            <div className="tank-stat-value" ref={valueRef}></div>
        </div>
    )
}

interface TankCarouselButtonHandle {
    triggerAnimation: () => void
}

interface TankCarouselButtonProps {
    left?: boolean
    right?: boolean
    onClick?: () => void,
    ref: Ref<TankCarouselButtonHandle>
}

const TankCarouselButton: React.FC<TankCarouselButtonProps> = (props) => {
 
    let classNames = ["tank-carousel-button"]
    if (props.left) classNames.push("tank-carousel-button-left")
    if (props.right) classNames.push("tank-carousel-button-right")

    const [triggered, setTriggered] = useState(false)
    const intervalHandle = useRef<number | null>(null)

    useImperativeHandle(props.ref, () => ({
        triggerAnimation: () => {
            if(intervalHandle.current) return

            setTriggered(true)
            intervalHandle.current = window.setTimeout(() => {
                intervalHandle.current = null
                setTriggered(false)
            }, 200)
        }
    }), [])
    
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
    const initialPosition = 0

    const [state, setState] = useState({
        shown: false,
        required: false,
        tankDescription: null as TankDescription | null,
    })

    const scene = useScene()
    const gameControls = useControls()
    const controlsResponderRef = useRef<ControlsResponder | null>(null)
    const carouselRef = useRef<TankSelectCarouselHandle | null>(null)
    const leftButtonRef = useRef<TankCarouselButtonHandle | null>(null)
    const rightButtonRef = useRef<TankCarouselButtonHandle | null>(null)
    const targetPositionRef = useRef<number>(initialPosition)
    const speedRowRef = useRef<TankStatRowHandle | null>(null)
    const damageRowRef = useRef<TankStatRowHandle | null>(null)
    const healthRowRef = useRef<TankStatRowHandle | null>(null)

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
        targetPositionRef.current--
        leftButtonRef.current?.triggerAnimation()
    }, [])

    const onNavigateRight = useCallback(() => {
        targetPositionRef.current++
        rightButtonRef.current?.triggerAnimation()
    }, [])

    const onConfirm = useCallback(() => {
        setState((state) => {
            let nearTankIndex = getNearIndex(carouselRef.current.getPosition())
            let nearTank = getTankForIndex(nearTankIndex)
            props.onTankSelect(nearTank.type)
            return {
                ...state,
                shown: false,
                required: false
            }
        })
    }, [])

    const onFrame = useCallback((dt: number) => {
        let currentPosition = carouselRef.current.getPosition()
        let delta = targetPositionRef.current - currentPosition

        let newPosition
        if (Math.abs(delta) < 0.001) {
            newPosition = targetPositionRef.current
        } else {
            let animationStep = delta - delta * Math.exp(-dt * 15)
            newPosition = currentPosition + animationStep
        }

        carouselRef.current.setPosition(newPosition)

        let nearTankIndex = getNearIndex(newPosition)
        let farTankIndex = getFarIndex(newPosition)
        let farWeight = getFarWeight(newPosition)
        let nearWeight = 1 - farWeight
        let nearTank = getTankForIndex(nearTankIndex)
        let farTank = getTankForIndex(farTankIndex)
        
        let nearStat = TankStats.stats[nearTank.type]
        let farStat = TankStats.stats[farTank.type]

        speedRowRef.current.setValue(nearStat.speed * nearWeight + farStat.speed * farWeight)
        damageRowRef.current.setValue(nearStat.damage * nearWeight + farStat.damage * farWeight)
        healthRowRef.current.setValue(nearStat.health * nearWeight + farStat.health * farWeight)

        setState(state => {
            if(state.tankDescription === nearTank) return state
            return { ...state, tankDescription: nearTank }
        })
    }, [])

    const onCarouselClick = useCallback((index: number) => {
        if(targetPositionRef.current === index) {
            props.onTankSelect(index)
        } else {
            targetPositionRef.current = index
        }
    }, [])

    useEffect(() => {
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
        scene.loop.on("tick", onFrame)
        return () => scene.loop.off("tick", onFrame)
    }, [state.shown])

    return  (
        <ControlsProvider ref={controlsResponderRef} enabled={state.shown}>
            <div className="tank-select-overlay" style={{display: state.shown ? undefined : "none"}}>
                <div className="tank-select-menu">
                    <TankSelectCarousel ref={carouselRef} shown={state.shown} initialPosition={initialPosition} onClick={onCarouselClick}/>
                    <div className="tank-title-container">
                        <div className="tank-title">{state.tankDescription?.name}</div>
                        <TankCarouselButton left
                            ref={leftButtonRef}
                            onClick={onNavigateLeft}/>
                        <TankCarouselButton right
                            ref={rightButtonRef}
                            onClick={onNavigateRight}/>
                    </div>
                    <div className="tank-description-menu">
                        <div className="tank-description-text">{state.tankDescription?.description}</div>
                        <div className="tank-description-stats">
                            <TankStatRow label="СКР" ref={speedRowRef} medianStatValue={TankStats.median.speed}/>
                            <TankStatRow label="АТК" ref={damageRowRef} medianStatValue={TankStats.median.damage}/>
                            <TankStatRow label="ЗАЩ" ref={healthRowRef} medianStatValue={TankStats.median.health}/>
                        </div>
                    </div>
                </div>
            </div>
        </ControlsProvider>
    )
})

export default TankSelectOverlay