import HugeInput, { HugeInputProps } from '../huge-input/huge-input'
import './huge-select.scss'
import React from 'react'

export interface SelectOption {
    name: string
    data?: string
    selected?: boolean
    defaultSelected?: boolean
}

export interface HugeSelectProps extends HugeInputProps {
    options: SelectOption[]
    defaultValue?: string
    disabled?: boolean
    onChange?: (value: string) => void
}

const HugeSelect: React.FC<HugeSelectProps> = (props) => {
    return (
        <HugeInput {...props}>
            <select 
                onChange={function (event) { props.onChange(this.value) }} 
                className="huge-input huge-select" 
                defaultValue={props.defaultValue}
                disabled={props.disabled}
            >
                {props.options.map((option, i) => (
                    <option key={i} value={option.data} selected={option.selected}>
                        {option.name}
                    </option>
                ))}
            </select>
        </HugeInput>
    )
}

export default HugeSelect;