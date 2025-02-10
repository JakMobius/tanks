import './huge-text-input.scss'

import HugeInput, { HugeInputProps } from "../huge-input/huge-input";
import React from 'react';

export interface HugeTextInputProps extends HugeInputProps {
    placeholder?: string
    value?: string
    type?: string
    onChange?: (value: string) => void
}

const HugeTextInput: React.FC<HugeTextInputProps> = (props) => {
    
    return (
        <HugeInput {...props}>
            <input 
                className="huge-input huge-text-input" 
                placeholder={props.placeholder} 
                value={props.value} 
                type={props.type}
                onChange={e => props.onChange?.(e.target.value)}/>
        </HugeInput>
    )
}

export default HugeTextInput