import './tip-list.scss'

import Cloud from "src/client/ui/cloud/cloud"
import React from "react"

export interface Tip {
    text: string
    style: string
}

export enum TipStyle {
    ERROR = "error",
    WARNING = "warning",
    FINE = "fine"
}

const TipList: React.FC<{tips: Tip[]}> = (props) => {
    return (
        <div className="tip-list">
            {props.tips?.map((tip, i) => {
                return (
                    <Cloud
                        key={i} className={"tip " + tip.style}>{tip.text}
                    </Cloud>
                )
            })}
        </div>
    )
}

export default TipList