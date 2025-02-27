import './pause-input-row.scss';

import PauseKeyValueRow from "src/client/ui/pause-overlay/elements/pause-key-value-row";
import AutoresizeInput from "src/client/ui/elements/autoresize-input/autoresize-input";
import Cloud, { CloudProps } from "src/client/game/ui/cloud/cloud";
import React, { useState, useCallback, useImperativeHandle } from 'react';

interface AutoresizeInputCloudProps extends CloudProps {
    prefix?: string,
    suffix?: string,
    placeholder?: string,
    value?: string,
    onChange?: (value: string) => void
}

const AutoresizeInputCloud: React.FC<AutoresizeInputCloudProps> = (props) => {
    const [inputValue, setInputValue] = useState(props.value || "");

    const handleInputChange = (value: string) => {
        setInputValue(value);
        if (props.onChange) {
            props.onChange(value);
        }
    };

    return (
        <Cloud
            className="autoresize-input-cloud"
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
    )
}

interface PauseKeyInputRowProps {
    title: string
    placeholder?: string
    value?: string
    prefix?: string
    suffix?: string
    small?: boolean
    blue?: boolean
    red?: boolean
    onChange?: (value: string) => void
}

export const PauseKeyInputRow: React.FC<PauseKeyInputRowProps> = (props) => {
    return (
        <PauseKeyValueRow small={props.small} className="pause-key-input-row">
            <Cloud 
                blue={props.blue}
                red={props.red}>
                    {props.title}
            </Cloud>
            <AutoresizeInputCloud 
                prefix={props.prefix} 
                suffix={props.suffix} 
                placeholder={props.placeholder} 
                value={props.value}
                blue={props.blue}
                red={props.red}
                onChange={props.onChange}
            />
        </PauseKeyValueRow>
    )
}

interface PauseInputDetailDisclosureProps {
    blue?: boolean
    red?: boolean
    button?: boolean
    onClick?: () => void
}

export const PauseInputDetailDisclosure: React.FC<PauseInputDetailDisclosureProps> = (props) => {
    return (
        <Cloud
            {...props}
            className="pause-input-row-detail-disclosure"
        />
    )
}

interface PauseInputRowProps {
    placeholder?: string
    value?: string
    blue?: boolean
    red?: boolean
    type?: string
    button?: React.ReactNode
    className?: string
    onButtonClick?: () => void
    onChange?: (value: string) => void
    onEnter?: () => void
    ref?: React.RefObject<HTMLInputElement>
}

export const PauseInputRow: React.FC<PauseInputRowProps> = (props) => {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {    
        props.onChange?.(e.target.value);
    }

    const handleKeydown = useCallback((e: React.KeyboardEvent) => {
        if(e.key === "Enter") props.onEnter?.();
    }, [props.onEnter])

    return (
        <div className={"pause-input-row " + (props.className ?? "")}>
            <Cloud
                className="input-container-cloud"
                blue={props.blue}
                red={props.red}
            >
                <input
                    ref={props.ref}
                    type={props.type}
                    value={props.value}
                    placeholder={props.placeholder}
                    onChange={handleChange}
                    onKeyDown={handleKeydown}
                />
            </Cloud>
            {props.button}
        </div>
    )
}