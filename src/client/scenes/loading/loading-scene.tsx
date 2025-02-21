import "./loading-scene.scss"

import {convertErrorToLoadingError, LoadingError} from "src/client/scenes/loading/loading-error";
import {Progress} from "src/client/utils/progress";
import { useScene } from "../scene-controller";
import { useCallback, useEffect, useState } from "react";

import {LoadingErrorAction} from "src/client/scenes/loading/loading-error";
import React from "react";

interface LoadingViewProps {
    title: string
    errorDescription: string | null
    errorActions: LoadingErrorAction[] | null
    loadingFraction: number | null
}

const LoadingView = (props: LoadingViewProps) => {
    return (
        <div className="loading-overlay">
            <div className="loading-view">
                <div className="tank-image"></div>
                <div className="loading-header">{props.title}</div>
                {props.loadingFraction !== null && (
                    <div className="loading-scale">
                        <div className="scale-fill" style={{width: (props.loadingFraction ?? 0) * 100 + "%"}}></div>
                    </div>
                )}
                {props.errorDescription && (
                    <div className="loading-error-description">{props.errorDescription}</div>
                )}
                {props.errorActions && (
                    <div className="loading-error-button-container">
                        {props.errorActions?.map((action, index) => (
                            <div
                                key={index}
                                className={"loading-error-button " + action.style}
                                onClick={action.callback}
                            >
                                {action.title}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export interface LoadingSceneProps {
    progress?: Progress
    error?: any
}

const LoadingScene: React.FC<LoadingSceneProps> = (props: LoadingSceneProps) => {
    const scene = useScene()

    const [state, setState] = useState({
        error: null as LoadingError | null,
        loadingFraction: 0
    })

    const onDraw = useCallback((dt: number) => {
        let fraction = props.progress?.getFraction()
        setState(state => {
            if(fraction == state.loadingFraction || state.error) return state
            
            return {
                ...state,
                loadingFraction: fraction
            }
        })
    }, [props.progress])

    useEffect(() => {
        scene.setTitle("Танчики - Загрузка")
        scene.loop.start()
        scene.canvas.clear()

        return () => {
            scene.setTitle(undefined)
            scene.loop.stop()
        }
    }, [])

    useEffect(() => {
        scene.loop.run = onDraw
        return () => scene.loop.run = null
    }, [onDraw])

    useEffect(() => {
        setState(state => ({
            ...state,
            error: convertErrorToLoadingError(props.error)
        }))
    }, [props.error])

    if(state.error) return (
        <LoadingView
            loadingFraction={null}
            title={state.error.getHeader()}
            errorDescription={state.error.getDescription()}
            errorActions={state.error.getActions()}
        />
    )
    return (
        <LoadingView
            loadingFraction={state.loadingFraction}
            title="Пожалуйста, подождите..."
            errorDescription={null}
            errorActions={null}
        />
    )
}

export default LoadingScene