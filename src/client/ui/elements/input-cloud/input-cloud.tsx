import "./input-cloud.scss"

import Cloud, {CloudProps} from "src/client/game/ui/cloud/cloud";
import AutoresizeInput from "src/client/ui/elements/autoresize-input/autoresize-input";
import React, { useState } from "react";

interface InputCloudProps extends CloudProps {
    prefix: string,
    suffix: string,
    placeholder: string,
    value: string,
    onChange?: (value: string) => void
}

const InputCloud: React.FC<InputCloudProps> = (props) => {
    const [inputValue, setInputValue] = useState(props.value || "");

    const handleInputChange = (value: string) => {
        setInputValue(value);
        if (props.onChange) {
            props.onChange(value);
        }
    };

    return <Cloud
        customClass="input-cloud"
        {...props}
    >
        <span>{props.prefix}</span>
        <AutoresizeInput 
            placeholder={props.placeholder} 
            value={inputValue}
            onChange={handleInputChange}
        ></AutoresizeInput>
        <span>{props.suffix}</span>
    </Cloud>
};

export default InputCloud;