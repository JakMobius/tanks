import './loading-view.scss'

import View from "src/client/ui/view";
import React from 'react';
import ReactDOM from 'react-dom/client';

interface LoadingViewProps {
    title?: React.ReactNode
    subtitle?: React.ReactNode
    shown?: boolean
}

export const LoadingViewComponent: React.FC<LoadingViewProps> = (props) => {
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

export default class LoadingView extends View {

    props: LoadingViewProps = {
        title: "Загрузка",
        subtitle: "Пожалуйста, подождите",
        shown: true
    }
    root: ReactDOM.Root

    constructor() {
        super()
        this.root = ReactDOM.createRoot(this.element[0])
    }

    render() {
        this.root.render(<LoadingViewComponent title={this.props.title} subtitle={this.props.subtitle}/>)
    }

    setTitle(title: string) {
        this.props.title = title
        this.render()
        return this
    }

    setSubtitle(subtitle: string) {
        this.props.subtitle = subtitle
        this.render()
        return this
    }

    show() {
        this.props.shown = true
        this.render()
        return this
    }

    hide() {
        this.props.shown = false
        this.render()
        return this
    }
}