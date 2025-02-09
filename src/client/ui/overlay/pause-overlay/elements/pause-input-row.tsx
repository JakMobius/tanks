
import PauseKeyValueRow from "src/client/ui/overlay/pause-overlay/elements/pause-key-value-row";
import InputCloud from "src/client/ui/elements/input-cloud/input-cloud";
import Cloud from "src/client/game/ui/cloud/cloud";

import React from 'react';

interface PauseInputRowProps {
    title?: string
    placeholder?: string
    value?: string
    prefix?: string
    suffix?: string
    small?: boolean
    blue?: boolean
    red?: boolean
    onChange?: (value: string) => void
}

const PauseInputRow: React.FC<PauseInputRowProps> = (props) => {
    return <PauseKeyValueRow small={props.small}>
        <Cloud 
            blue={props.blue}
            red={props.red}
            text={props.title}
            customClass="key-name"/>
        <InputCloud 
            prefix={props.prefix} 
            suffix={props.suffix} 
            placeholder={props.placeholder} 
            value={props.value}
            blue={props.blue}
            red={props.red}
            onChange={props.onChange}
        />
    </PauseKeyValueRow>
}

export default PauseInputRow;