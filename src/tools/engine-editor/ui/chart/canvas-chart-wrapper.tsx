import React, { useEffect, useMemo, useRef, useCallback } from "react";
import { CanvasChart } from "./canvas-chart";
import { CanvasTooltip } from "./canvas-tooltip";
import Legend from "./legend";
import { CanvasChartManager, ChartPoint } from "./canvas-chart-manager";
import "./chart.scss";

interface CanvasChartWrapperProps {
    data: Record<string, any>[];
}

const CanvasChartWrapper: React.FC<CanvasChartWrapperProps> = ({ data }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const chartManager = useMemo(() => new CanvasChartManager(), []);
    
    // State for tooltips
    const [tooltipPosition, setTooltipPosition] = React.useState<{ x: number; y: number } | null>(null);
    const [tooltipData, setTooltipData] = React.useState<ChartPoint | null>(null);
    const [hoveredMetric, setHoveredMetric] = React.useState<string | null>(null);
    
    // Get reactive values
    const activeMetrics = chartManager.useActiveMetrics();
    const metrics = chartManager.useMetrics();
    
    // Set data and handle resize
    useEffect(() => {
        chartManager.setData(data);
    }, [data, chartManager]);

    useEffect(() => {
        chartManager.setActiveMetrics(chartManager.getMetrics().slice());
    }, [])
    
    useEffect(() => {
        if (!containerRef.current) return undefined;
        
        const handleResize = () => {
            const containerWidth = containerRef.current?.clientWidth || 0;
            const containerHeight = containerRef.current?.clientHeight || 0;
            
            if (containerWidth > 0 && containerHeight > 0) {
                chartManager.setSize(containerWidth, containerHeight);
            }
        };
        
        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(containerRef.current);
        
        // Initial sizing
        handleResize();
        
        return () => {
            resizeObserver.disconnect();
        };
    }, [containerRef, chartManager]);
    
    // Handle chart mouse events - use useCallback to prevent unnecessary re-renders
    const handleChartMouseMove = useCallback((
        position: { x: number; y: number } | null, 
        data: ChartPoint | null
    ) => {
        setTooltipPosition(position);
        setTooltipData(data);
    }, []);
    
    // Handle legend events
    const handleLegendToggle = useCallback((metric: string) => {
        const newActiveMetrics = [...activeMetrics];
        const index = newActiveMetrics.indexOf(metric);
        
        if (index !== -1) {
            newActiveMetrics.splice(index, 1);
        } else {
            newActiveMetrics.push(metric);
        }
        
        chartManager.setActiveMetrics(newActiveMetrics);
    }, [activeMetrics, chartManager]);
    
    const handleLegendHover = useCallback((metric: string | null) => {
        setHoveredMetric(metric);
    }, []);
    
    return (
        <div className="canvas-chart-container" ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
            <CanvasChart 
                chartManager={chartManager} 
                onMouseMove={handleChartMouseMove}
                hoveredMetric={hoveredMetric}
            />
            {tooltipPosition && tooltipData && (
                <CanvasTooltip
                    position={tooltipPosition}
                    data={tooltipData}
                    activeMetrics={activeMetrics}
                    getColor={(metric) => chartManager.getColor(metric)}
                    xField="time"
                    formatX={(value) => `Time: ${Number(value).toFixed(2)}s`}
                    formatY={(value) => typeof value === "number" ? value.toFixed(2) : `${value}`}
                />
            )}
            <Legend
                metrics={metrics}
                activeMetrics={activeMetrics}
                getColor={(metric) => chartManager.getColor(metric)}
                onToggle={handleLegendToggle}
                onHover={handleLegendHover}
            />
        </div>
    );
};

export default CanvasChartWrapper;