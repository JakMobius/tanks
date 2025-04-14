import React, { useState, useRef, useEffect } from 'react';

interface AutoResizableInputProps {
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    min?: number;
    max?: number;
    className?: string;
    suffix?: string;
    style?: React.CSSProperties;
    id?: string;
}

const AutoResizableInput: React.FC<AutoResizableInputProps> = ({
    value,
    onChange,
    type = 'text', // Changed default from 'text' to maintain text inputs
    min,
    max,
    className = '',
    suffix = '',
    style = {},
    id
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const measureRef = useRef<HTMLSpanElement>(null);
    const [inputWidth, setInputWidth] = useState(0);

    // Update width when value changes
    useEffect(() => {
        updateWidth();
    }, [value]);

    // Initialize with correct width
    useEffect(() => {
        updateWidth();
        // Set up resize observer to handle font changes, etc.
        if (measureRef.current) {
            const resizeObserver = new ResizeObserver(() => {
                updateWidth();
            });
            resizeObserver.observe(measureRef.current);
            return () => resizeObserver.disconnect();
        }
        return undefined
    }, []);

    const updateWidth = () => {
        if (measureRef.current) {
            // Calculate width based on content
            const minWidth = 30; // Minimum width in pixels
            const padding = 4;
            const measuredWidth = measureRef.current.clientWidth;
            setInputWidth(Math.max(minWidth, measuredWidth + padding));
        }
    };

    return (
        <div
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                position: 'relative',
                border: '1px solid #ccc',
                borderRadius: '3px',
                padding: '2px 4px',
                backgroundColor: '#fff',
                ...style
            }}
            className={`autoresizable-input-container ${className}`}
        >
            <input
                ref={inputRef}
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                min={min}
                max={max}
                style={{
                    width: `${inputWidth}px`,
                    border: 'none',
                    outline: 'none',
                    padding: 0,
                    margin: 0,
                    backgroundColor: 'transparent',
                    fontSize: 'inherit',
                    fontFamily: 'inherit'
                }}
            />

            {suffix && (
                <span
                    style={{
                        marginLeft: '2px',
                        color: '#666',
                        fontSize: 'inherit',
                        userSelect: 'none'
                    }}
                >
                    {suffix}
                </span>
            )}

            {/* Hidden element for measuring text width */}
            <span
                ref={measureRef}
                style={{
                    visibility: 'hidden',
                    position: 'absolute',
                    whiteSpace: 'pre',
                    fontSize: 'inherit',
                    fontFamily: 'inherit'
                }}
            >
                {value}
            </span>
        </div>
    );
};

export default AutoResizableInput;