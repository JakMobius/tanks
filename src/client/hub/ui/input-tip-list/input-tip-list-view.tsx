import './input-tip-list-view.scss'
import React from 'react';

export enum TipStyle {
    FINE = "fine",
    WEAK_WARNING = "weak-warning",
    WARNING = "warning",
    ERROR = "error"
}

export interface Tip {
    style: TipStyle;
    text: string
}

export interface TipProps {
    tips: Tip[]
}

export const InputTipListComponent: React.FC<TipProps> = (props) => {
    return (
        <div className="tip-list">
            {props.tips.map((tip, i) => {
                return <span key={i} className={"tip " + tip.style}>{tip.text}</span>
            })}
        </div>
    );
}