import './axis-selector.scss'

import Cloud from "src/client/game/ui/cloud/cloud";
import PauseKeyValueRow from "src/client/ui/overlay/pause-overlay/elements/pause-key-value-row";
import React from 'react';

interface AxisSelectorProps {
    text?: string
    axes: string[]
}

const AxisSelector: React.FC<AxisSelectorProps> = (props) => {

    const getAxes = (axes: string[]) => {
        if(axes.length > 0) {
            return axes.map((axle, i) => 
                <Cloud key={i} blue className='mapped-key'> {axle} </Cloud>
            )
        } else {
            return <Cloud className='mapped-key'> Не установлено </Cloud>
        }
    }

    return <PauseKeyValueRow small className="axis-selector">
        <Cloud blue className='key-name'>{props.text}</Cloud>
        <div className='mapped-keys'>
            {getAxes(props.axes)}
        </div>
    </PauseKeyValueRow>
}

export default AxisSelector;