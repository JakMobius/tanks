import './pause-slider-row.scss'

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {clamp} from "src/utils/utils";

export interface PauseSliderRowProps {
    title: string
    min: number
    max: number
    value: number
    onChange: (value: number) => void
}

const PauseSliderRow: React.FC<PauseSliderRowProps> = (props) => {

    const [isDragging, setIsDragging] = useState(false);

    const scale = useRef<HTMLDivElement>(null);
    const antiScale = useRef<HTMLDivElement>(null);

    const handleMouseX = (x: number) => {
        const slider = document.querySelector('.pause-slider-row') as HTMLElement;
        const rect = slider.getBoundingClientRect();
        const offsetX = x - rect.left;
        const percent = clamp(offsetX / rect.width, 0, 1);
        const newValue = props.min + (props.max - props.min) * percent;
        props.onChange(newValue);
    }

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        setIsDragging(true);
        handleMouseX(e.clientX);
    }, []);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;
        handleMouseX(e.clientX)
    }, [isDragging, props]);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    useEffect(() => {
        let percent = (props.value - props.min) / (props.max - props.min) * 100;
        if (scale.current) {
            scale.current.style.width = percent + "%";
        }
        if (antiScale.current) {
            antiScale.current.style.width = (100 - percent) + "%";
        }
    }, [props.value, props.min, props.max]);

    return (
        <div 
            className="pause-slider-row"
            onMouseDown={handleMouseDown}
        >
            <div className="slider-scale" ref={scale}></div>
            <div className="slider-anti-scale" ref={antiScale}></div>
            <div className="slider-text-container">
                <div className="slider-description">{props.title}</div>
                <div className="slider-value">{Math.round(props.value)}</div>
            </div>
        </div>
    );
}

export default PauseSliderRow;