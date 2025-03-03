import './loading-view.scss'

import React from 'react';

interface LoadingViewProps {
    title?: React.ReactNode
    subtitle?: React.ReactNode
    shown?: boolean
}

export const LoadingView: React.FC<LoadingViewProps> = (props) => {
    return (
        <div className="loading-container" style={{ display: props.shown ? undefined : "none" }}>
            <div className="loading-icon"></div>
            <div className="loading-title" style={{display: props.title ? undefined : "none"}}>
                {props.title}
            </div>
            <div className="loading-subtitle" style={{display: props.title ? undefined : "none"}}>
                {props.subtitle}
            </div>
        </div>
    );
}

export default LoadingView;