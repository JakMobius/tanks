import './button.scss'

import View from "../view";
import React from 'react';
import ReactDOM from 'react-dom/client';

interface ButtonProps {
    children?: string
    secondaryStyle?: boolean
    largeStyle?: boolean
    onClick?: () => void
}

export const ButtonComponent: React.FC<ButtonProps> = (props) => {
    return (
        <button 
            className={`button ${props.secondaryStyle ? "secondary" : ""} ${props.largeStyle ? "large" : ""}`}
            onClick={props.onClick}
        >{props.children}</button>
    );
}

export default class Button extends View {
    
    props: ButtonProps = {}
    root: ReactDOM.Root

    constructor(text: string = null) {
        super();
        this.props.children = text
        this.root = ReactDOM.createRoot(this.element[0])
        this.render()
    }

    render() {
        this.root.render(<ButtonComponent {...this.props}/>)
    }

    largeStyle() {
        this.props.largeStyle = true
        this.render()
        return this
    }

    secondaryStyle() {
        this.props.secondaryStyle = true
        this.render()
        return this
    }
}