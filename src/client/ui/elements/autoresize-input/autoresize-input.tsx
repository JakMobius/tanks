import React, { useEffect, useRef, useState } from "react";
import "./autoresize-input.scss";

interface AutoresizeInputProps {
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
}

const AutoresizeInput: React.FC<AutoresizeInputProps> = (props) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const spanRef = useRef<HTMLSpanElement>(null);

    const [value, setValue] = useState(props.value || "");
    const [placeholder] = useState(props.placeholder || "");

    useEffect(() => {
        const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                let width = entry.contentBoxSize[0].inlineSize;
                if (inputRef.current) {
                    inputRef.current.style.width = width + "px";
                }
            }
        });

        if (spanRef.current) {
            observer.observe(spanRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, []);

    const updateSpan = () => {
        if (spanRef.current) {
            spanRef.current.textContent = value || placeholder;
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setValue(newValue);
        if (props.onChange) {
            props.onChange(newValue);
        }
    };

    useEffect(() => {
        updateSpan();
    }, [value, placeholder]);

    return (
        <div className="autoresize-input">
            <span ref={spanRef}></span>
            <input
                ref={inputRef}
                value={value}
                placeholder={placeholder}
                onChange={handleChange}
            />
        </div>
    );
};

export default AutoresizeInput;