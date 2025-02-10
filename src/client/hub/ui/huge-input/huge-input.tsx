import './huge-input.scss'

import { InputTipListComponent, Tip } from "../input-tip-list/input-tip-list-view";
import React from 'react';

export interface HugeInputProps {
    button?: {
        text: string
        onClick: () => void
    }
    tips?: Tip[]
    children?: React.ReactNode
}

const HugeInput: React.FC<HugeInputProps> = (props) => {
    return (
        <div className={"huge-input-container" + (props.button ? " with-button" : "")}>
            {props.children}
            {props.button ? (
                <button className="huge-input-button" onClick={props.button.onClick}>
                    {props.button.text}
                </button>
            ) : undefined}
            {(props.tips && props.tips.length > 0) ? (
                <InputTipListComponent tips={props.tips}/>
            ) : undefined}
        </div>
    );
}

export default HugeInput