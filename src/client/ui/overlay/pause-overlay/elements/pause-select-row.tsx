import './pause-select-row.scss'
import React, { useEffect } from 'react';
import Cloud from "src/client/game/ui/cloud/cloud";

export interface SelectOption {
    name: string
    data?: string
    displayName?: string
}

export interface PauseKeySelectRowProps {
    title: string
    options: SelectOption[]
    defaultValue?: string
    disabled?: boolean
    blue?: boolean
    red?: boolean
    onChange?: (value: string) => void
}

const PauseKeySelectRow: React.FC<PauseKeySelectRowProps> = (props) => {

    const convertValueToText = (value: string) => {
        const option = props.options.find((option) => option.data === value)
        return option?.displayName ?? option?.name ?? ""
    }

    const selectRef = React.useRef<HTMLSelectElement>(null)

    const [state, setState] = React.useState({
        selectedValue: props.defaultValue ?? "",
        selectedText: convertValueToText(props.defaultValue ?? "")
    })

    const handleChange = (value: string) => {
        setState({
            selectedText: convertValueToText(value),
            selectedValue: value
        })

        props.onChange?.(value)
    }

    useEffect(() => {
        if (!selectRef.current) return
        if(selectRef.current.value !== state.selectedValue) {
            handleChange(selectRef.current.value)
            props.onChange?.(selectRef.current.value)
        }
    })
    
    return (
        <div className="pause-select-row">
            <Cloud blue={props.blue} red={props.red}>{props.title}</Cloud>
            <Cloud blue={props.blue} red={props.red}>
                {state.selectedText}
                <select
                    ref={selectRef}
                    onChange={function (event) {
                        handleChange(event.target.value)
                    }}
                    defaultValue={props.defaultValue}
                    disabled={props.disabled}
                >
                    {props.options.map((option, i) => (
                        <option key={i} value={option.data}>
                            {option.name}
                        </option>
                    ))}
                </select>
            </Cloud>
        </div>
    )
}

export default PauseKeySelectRow;