import './loading-view.scss'

import Overlay from "src/client/ui/overlay/overlay";

import ReactDOM from 'react-dom/client';
import {LoadingErrorAction} from "src/client/scenes/loading/loading-error";
import React from 'react';

interface LoadingViewProps {
    title: string
    errorDescription: string | null
    errorActions: LoadingErrorAction[] | null
    loadingFraction: number | null
}

const LoadingView = (props: LoadingViewProps) => {
    return (
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
    )
}

export default class LoadingOverlay extends Overlay {
    reactRoot: ReactDOM.Root
    props: LoadingViewProps = {
        title: "Пожалуйста, подождите...",
        errorActions: null,
        errorDescription: null,
        loadingFraction: null
    }

    constructor() {
        super();

        this.reactRoot = ReactDOM.createRoot(this.element[0])
        this.reactRoot.render(<LoadingView {...this.props}/>)
    }

    setState(props: Partial<LoadingViewProps>) {
        this.props = {...this.props, ...props}
        this.reactRoot.render(<LoadingView {...this.props}/>)
    }
}