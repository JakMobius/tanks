import './pause-select-row.scss'
import React from 'react';
import Cloud from "src/client/game/ui/cloud/cloud";

interface PauseSelectRowProps {
    text?: string
    value?: string
}

const PauseSelectRow: React.FC<PauseSelectRowProps> = (props) => {
    return <div className="pause-select-row">
        <Cloud blue>{props.text}</Cloud>
        <Cloud blue button>{props.value}</Cloud>
    </div>
}

export default PauseSelectRow;