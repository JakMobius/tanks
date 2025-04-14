import React from "react";
import { ChartPoint } from "./canvas-chart-manager";
import "./tooltip.scss";

interface CanvasTooltipProps {
    position: { x: number; y: number } | null;
    data: ChartPoint | null;
    activeMetrics: string[];
    getColor: (metric: string) => string;
    xField: string;
    formatX?: (value: any) => string;
    formatY?: (value: any) => string;
}

export const CanvasTooltip: React.FC<CanvasTooltipProps> = ({
    position,
    data,
    activeMetrics,
    getColor,
    xField,
    formatX = (value) => `${value}`,
    formatY = (value) => `${value}`
}) => {
    if (!position || !data) return null;
    
    return (
        <div 
            className="chart-tooltip"
            style={{
                left: `${position.x}px`,
                top: `${position.y - 10}px`,
                transform: "translate(-50%, -100%)"
            }}
        >
            <div className="tooltip-header">
                {formatX(data[xField])}
            </div>
            <div className="tooltip-body">
                {activeMetrics.map((metric) => (
                    <div key={metric} className="tooltip-row">
                        <div 
                            className="tooltip-color-marker" 
                            style={{ backgroundColor: getColor(metric) }}
                        />
                        <div className="tooltip-label">{metric}:</div>
                        <div className="tooltip-value">{formatY(data[metric])}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};