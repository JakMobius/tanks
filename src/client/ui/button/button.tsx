import './button.scss'

import React from 'react';

interface ButtonProps {
    children?: string
    secondaryStyle?: boolean
    largeStyle?: boolean
    onClick?: () => void
}

export const Button: React.FC<ButtonProps> = (props) => {
    return (
        <button 
            className={`button ${props.secondaryStyle ? "secondary" : ""} ${props.largeStyle ? "large" : ""}`}
            onClick={props.onClick}
        >{props.children}</button>
    );
}

export default Button;