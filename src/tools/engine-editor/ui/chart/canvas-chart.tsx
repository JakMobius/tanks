import React, { useRef, useEffect, useState } from "react";
import { CanvasChartManager, ChartMargin, ChartPoint, ChartRange, ChartSize } from "./canvas-chart-manager";
import "./chart.scss";

interface CanvasChartProps {
    chartManager: CanvasChartManager;
    onMouseMove?: (position: { x: number; y: number } | null, data: ChartPoint | null) => void;
    hoveredMetric?: string | null;
}

export const CanvasChart: React.FC<CanvasChartProps> = ({ 
    chartManager, 
    onMouseMove,
    hoveredMetric 
}) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    
    // Get reactive values from the chart manager
    const size = chartManager.useSize();
    const data = chartManager.useData();
    const metrics = chartManager.useMetrics();
    const activeMetrics = chartManager.useActiveMetrics();
    const xRange = chartManager.useXRange();
    const zoom = chartManager.useZoom();
    const pan = chartManager.usePan();
    
    // Track drag and zoom states
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
    const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
    
    // Track hover state for vertical line and dots
    const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
    const [hoverData, setHoverData] = useState<ChartPoint | null>(null);
    
    // Initialize canvas and handle resize
    useEffect(() => {
        const resizeCanvas = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            
            const parent = canvas.parentElement;
            if (!parent) return;
            
            const devicePixelRatio = window.devicePixelRatio || 1;
            canvas.width = parent.clientWidth * devicePixelRatio;
            canvas.height = parent.clientHeight * devicePixelRatio;
            canvas.style.width = `${parent.clientWidth}px`;
            canvas.style.height = `${parent.clientHeight}px`;
            
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            
            ctx.resetTransform();
            ctx.scale(devicePixelRatio, devicePixelRatio);
            
            drawChart();
        };
        
        resizeCanvas();
        
        const resizeObserver = new ResizeObserver(() => {
            resizeCanvas();
        });
        
        if (canvasRef.current?.parentElement) {
            resizeObserver.observe(canvasRef.current.parentElement);
        }
        
        return () => resizeObserver.disconnect();
    }, []);
    
    // Redraw chart when any of the data or view properties change
    useEffect(() => {
        if (data?.length && size) {
            drawChart();
        }
    }, [data, size, metrics, activeMetrics, xRange, zoom, pan, hoveredMetric, hoverPosition, hoverData]);
    
    const drawChart = () => {
        const canvas = canvasRef.current;
        if (!canvas || !size) return;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
        
        const { width, height, plotWidth, plotHeight } = size;
        const margin = chartManager.getMargin();
        
        // Draw background grid
        drawGrid(ctx, margin, plotWidth, plotHeight);
        
        // Draw axes
        drawAxes(ctx, margin, plotWidth, plotHeight, xRange);
        
        // Draw data lines
        for (const metric of metrics) {
            if (!activeMetrics.includes(metric)) continue;
            
            const isHighlighted = hoveredMetric === metric || hoveredMetric === null;
            drawDataLine(ctx, metric, isHighlighted);
        }
        
        // Draw vertical line and intersection dots if hovering
        if (hoverPosition && hoverData && data?.length) {
            drawVerticalLineAndDots(ctx, hoverPosition.x, margin, plotHeight);
        }
    };
    
    const drawGrid = (
        ctx: CanvasRenderingContext2D,
        margin: ChartMargin,
        plotWidth: number,
        plotHeight: number
    ) => {
        ctx.strokeStyle = "#eee";
        ctx.lineWidth = 1;
        
        // Draw horizontal grid lines
        const ySteps = 5;
        for (let i = 0; i <= ySteps; i++) {
            const y = margin.top + (i / ySteps) * plotHeight;
            ctx.beginPath();
            ctx.moveTo(margin.left, y);
            ctx.lineTo(margin.left + plotWidth, y);
            ctx.stroke();
        }
        
        // Draw vertical grid lines
        const xSteps = 5;
        for (let i = 0; i <= xSteps; i++) {
            const x = margin.left + (i / xSteps) * plotWidth;
            ctx.beginPath();
            ctx.moveTo(x, margin.top);
            ctx.lineTo(x, margin.top + plotHeight);
            ctx.stroke();
        }
    };
    
    const drawAxes = (
        ctx: CanvasRenderingContext2D,
        margin: ChartMargin,
        plotWidth: number,
        plotHeight: number,
        xRange: ChartRange
    ) => {
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1;
        ctx.fillStyle = "#000";
        ctx.font = "10px Arial";
        ctx.textAlign = "center";
        
        // Draw x-axis
        ctx.beginPath();
        ctx.moveTo(margin.left, margin.top + plotHeight);
        ctx.lineTo(margin.left + plotWidth, margin.top + plotHeight);
        ctx.stroke();
        
        // Draw x-axis ticks and labels
        const xSteps = 5;
        for (let i = 0; i <= xSteps; i++) {
            const value = xRange.min + (i / xSteps) * (xRange.max - xRange.min);
            const x = margin.left + (i / xSteps) * plotWidth;
            
            // Draw tick
            ctx.beginPath();
            ctx.moveTo(x, margin.top + plotHeight);
            ctx.lineTo(x, margin.top + plotHeight + 5);
            ctx.stroke();
            
            // Draw label
            ctx.fillText(value.toFixed(1), x, margin.top + plotHeight + 15);
        }
        
        // Draw y-axis
        ctx.beginPath();
        ctx.moveTo(margin.left, margin.top);
        ctx.lineTo(margin.left, margin.top + plotHeight);
        ctx.stroke();
    };
    
    const drawDataLine = (
        ctx: CanvasRenderingContext2D,
        metric: string,
        isHighlighted: boolean
    ) => {
        if (!data || data.length === 0) return;
        
        const color = chartManager.getColor(metric);
        ctx.strokeStyle = isHighlighted ? color : `${color}80`; // Add transparency when not highlighted
        ctx.lineWidth = isHighlighted ? 2 : 1.5;
        ctx.beginPath();
        
        let firstPoint = true;
        for (const point of data) {
            const x = chartManager.chartToScreenX(point.time);
            const y = chartManager.chartToScreenY(point[metric], metric);
            
            if (firstPoint) {
                ctx.moveTo(x, y);
                firstPoint = false;
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
    };
    
    // Draw vertical line at hover position with dots at intersections
    const drawVerticalLineAndDots = (
        ctx: CanvasRenderingContext2D,
        mouseX: number,
        margin: ChartMargin,
        plotHeight: number
    ) => {
        if (!data || data.length === 0 || !hoverData) return;
        
        // Draw vertical line
        ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 2]);
        ctx.beginPath();
        ctx.moveTo(mouseX, margin.top);
        ctx.lineTo(mouseX, margin.top + plotHeight);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw dots at intersections with data lines
        for (const metric of metrics) {
            if (!activeMetrics.includes(metric) || !hoverData[metric]) continue;
            
            const y = chartManager.chartToScreenY(hoverData[metric], metric);
            const color = chartManager.getColor(metric);
            
            // Draw outer white circle for contrast
            ctx.beginPath();
            ctx.arc(mouseX, y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = "white";
            ctx.fill();
            
            // Draw colored circle
            ctx.beginPath();
            ctx.arc(mouseX, y, 3.5, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
        }
    };
    
    // Find nearest data point to provided screen coordinates
    const findNearestDataPoint = (mouseX: number, mouseY: number): { point: ChartPoint; index: number } | null => {
        if (!data || data.length === 0 || !size) return null;
        
        // Convert screen X to data X
        const dataX = chartManager.screenToChartX(mouseX);
        
        // Find the closest point based on X coordinate
        let closestIndex = 0;
        let closestDistance = Math.abs(data[0].time - dataX);
        
        for (let i = 1; i < data.length; i++) {
            const distance = Math.abs(data[i].time - dataX);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = i;
            }
        }
        
        return {
            point: data[closestIndex],
            index: closestIndex
        };
    };
    
    // Handle mouse events for pan and zoom
    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (e.button === 0) { // Left click
            setIsDragging(true);
            setDragStart({ x: e.clientX, y: e.clientY });
            setPanStart({ x: pan.x, y: pan.y });
        }
    };
    
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        if (isDragging && dragStart && panStart && size) {
            // Drag handling for panning
            const dx = e.clientX - dragStart.x;
            const dy = e.clientY - dragStart.y;
            
            // Convert screen movement to data movement based on current zoom level
            const xDelta = (dx / size.plotWidth) * (xRange.max - xRange.min) / zoom.x;
            
            // Update pan - note we're moving in the opposite direction of drag
            chartManager.setPan({
                x: panStart.x - xDelta,
                y: pan.y // Only implement X panning for now
            });
        } else if (onMouseMove) {
            // Find data point for tooltip
            const margin = chartManager.getMargin();
            
            // Check if mouse is within the plot area
            if (
                mouseX >= margin.left && 
                mouseX <= size?.width - margin.right && 
                mouseY >= margin.top && 
                mouseY <= size?.height - margin.bottom
            ) {
                const nearestPoint = findNearestDataPoint(mouseX, mouseY);
                if (nearestPoint) {
                    // Update hover state
                    setHoverPosition({ x: mouseX, y: mouseY });
                    setHoverData(nearestPoint.point);
                    onMouseMove({ x: mouseX, y: mouseY }, nearestPoint.point);
                }
            } else {
                // Clear hover state
                setHoverPosition(null);
                setHoverData(null);
                onMouseMove(null, null);
            }
        }
    };
    
    const handleMouseUp = () => {
        setIsDragging(false);
        setDragStart(null);
        setPanStart(null);
    };
    
    const handleMouseLeave = () => {
        handleMouseUp();
        setHoverPosition(null);
        setHoverData(null);
        if (onMouseMove) {
            onMouseMove(null, null);
        }
    };
    
    const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        
        const canvas = canvasRef.current;
        if (!canvas || !size) return;
        
        // Get mouse position relative to canvas
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const margin = chartManager.getMargin();
        
        // Check if the mouse is inside the plotting area
        if (mouseX < margin.left || mouseX > margin.left + size.plotWidth) {
            return;
        }
        
        // Calculate the mouse position as proportion of the plotting area
        const mouseXProportion = (mouseX - margin.left) / size.plotWidth;
        
        // Convert to the data domain value at the mouse position
        const dataX = xRange.min + mouseXProportion * (xRange.max - xRange.min);
        
        // Calculate zoom factor based on wheel delta
        const zoomFactor = e.deltaY < 0 ? 1.2 : 0.8; // Zoom in or out
        const newZoomX = Math.max(1, Math.min(20, zoom.x * zoomFactor)); // Limit zoom level between 1x and 20x
        
        // Calculate new pan to keep the point under the mouse in the same position
        // For zoom in: we need to move the view so that the point under the mouse stays there
        // For zoom out: we need to adjust in the opposite direction
        const visibleRangeWidth = (xRange.max - xRange.min) / zoom.x;
        const newVisibleRangeWidth = (xRange.max - xRange.min) / newZoomX;
        const panAdjustment = (newVisibleRangeWidth - visibleRangeWidth) * mouseXProportion;
        
        // Apply new zoom and pan 
        chartManager.setZoom({ x: newZoomX, y: zoom.y });
        chartManager.setPan({ x: pan.x - panAdjustment, y: pan.y });
    };
    
    return (
        <canvas
            ref={canvasRef}
            className="chart-canvas"
            style={{ width: "100%", height: "100%", cursor: isDragging ? "grabbing" : "grab" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onWheel={handleWheel}
        />
    );
};