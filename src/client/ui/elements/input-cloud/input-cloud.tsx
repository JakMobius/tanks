import "./input-cloud.scss"

import Cloud, {CloudComponent, CloudProps} from "src/client/game/ui/cloud/cloud";
import AutoresizeInput from "src/client/ui/elements/autoresize-input/autoresize-input";
import React, { useState } from "react";
import ReactDOM from "react-dom/client";

interface InputCloudProps extends CloudProps {
    prefix: string,
    suffix: string,
    placeholder: string,
    value: string,
    onChange?: (value: string) => void
}

export const InputCloudComponent: React.FC<InputCloudProps> = (props) => {
    const [inputValue, setInputValue] = useState(props.value || "");

    const handleInputChange = (value: string) => {
        setInputValue(value);
        if (props.onChange) {
            props.onChange(value);
        }
    };

    return <CloudComponent
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
    </CloudComponent>
};

export default class InputCloud extends Cloud {
    props: InputCloudProps
    value: string
    root: ReactDOM.Root

    constructor() {
        super()
        this.value = ""
        this.props.onChange = (value) => { 
            this.value = value
        }

        this.customClass("input-cloud")
        this.root = ReactDOM.createRoot(this.element[0]);
    }

    renderReactComponent() {
        this.root.render(<InputCloudComponent {...this.props} />);
    }

    setPrefix(prefix: string) {
        this.props.prefix = prefix
        this.renderReactComponent()
        return this
    }

    setSuffix(suffix: string) {
        this.props.suffix = suffix
        this.renderReactComponent()
        return this
    }

    setPlaceholder(placeholder: string) {
        this.props.placeholder = placeholder
        this.renderReactComponent()
        return this
    }

    getPlaceholder() {
        return this.props.placeholder
    }

    setValue(value: string) {
        this.props.value = value
        this.value = value
        this.renderReactComponent()
        return this
    }

    getValue() {
        return this.value
    }

    focus() {
        // TODO: this is a hack to focus the input, need to find a better way
        this.element.find("input").trigger("focus")
        return
    }
}