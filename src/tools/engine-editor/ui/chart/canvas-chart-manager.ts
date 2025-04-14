import { useEffect, useState } from "react";
import EventEmitter from "src/utils/event-emitter";

export interface ChartPoint {
    [key: string]: any;
}

export interface ChartRange {
    min: number;
    max: number;
}

export interface ChartSize {
    width: number;
    height: number;
    plotWidth: number;
    plotHeight: number;
}

export interface ChartMargin {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export interface ChartZoom {
    x: number;
    y: number;
}

export interface ChartPan {
    x: number;
    y: number;
}

export class CanvasChartManager extends EventEmitter {
    // Container dimensions
    private containerWidth: number = 0;
    private containerHeight: number = 0;
    
    // Data and metrics
    private data: ChartPoint[] = [];
    private metrics: string[] = [];
    private activeMetrics: string[] = [];
    
    // Visual settings
    private margin: ChartMargin = { top: 30, right: 30, bottom: 30, left: 30 };
    private colors: string[] = [
        "#1f77b4", // blue
        "#ff7f0e", // orange
        "#2ca02c", // green
        "#d62728", // red
        "#9467bd", // purple
        "#8c564b", // brown
        "#e377c2", // pink
        "#7f7f7f", // gray
        "#bcbd22", // olive
        "#17becf"  // cyan
    ];
    
    // Ranges for data
    private xRange: ChartRange = { min: 0, max: 1 };
    private yRanges: Map<string, ChartRange> = new Map();
    
    // Interaction state
    private zoom: ChartZoom = { x: 1, y: 1 };
    private pan: ChartPan = { x: 0, y: 0 };
    
    constructor() {
        super();
    }

    // ======== Core Methods ========
    
    // Screen to chart coordinate conversion (x-axis)
    public screenToChartX(screenX: number): number {
        const usablePlotWidth = this.getChartWidth();
        const plotRatio = (screenX - this.margin.left) / usablePlotWidth;
        return this.xRange.min + ((this.xRange.max - this.xRange.min) * plotRatio) / this.zoom.x + this.pan.x;
    }
    
    // Chart to screen coordinate conversion (x-axis)
    public chartToScreenX(chartX: number): number {
        const usablePlotWidth = this.getChartWidth();
        const adjustedX = (chartX - this.pan.x) * this.zoom.x;
        const plotRatio = (adjustedX - this.xRange.min) / (this.xRange.max - this.xRange.min);
        return this.margin.left + (usablePlotWidth * plotRatio);
    }
    
    // Screen to chart coordinate conversion (y-axis)
    public screenToChartY(screenY: number, metric: string): number {
        const range = this.yRanges.get(metric) || { min: 0, max: 1 };
        const usablePlotHeight = this.getChartHeight();
        const plotRatio = (screenY - this.margin.top) / usablePlotHeight;
        // Invert Y because screen coordinates increase downward
        return range.max - ((range.max - range.min) * plotRatio) / this.zoom.y + this.pan.y;
    }
    
    // Chart to screen coordinate conversion (y-axis)
    public chartToScreenY(chartY: number, metric: string): number {
        const range = this.yRanges.get(metric) || { min: 0, max: 1 };
        const usablePlotHeight = this.getChartHeight();
        const adjustedY = (chartY - this.pan.y) * this.zoom.y;
        // Invert Y because screen coordinates increase downward
        const plotRatio = (range.max - adjustedY) / (range.max - range.min);
        return this.margin.top + (usablePlotHeight * plotRatio);
    }

    // ======== Getters and Setters ========
    
    public getChartWidth(): number {
        return this.containerWidth - this.margin.left - this.margin.right;
    }

    public getChartHeight(): number {
        return this.containerHeight - this.margin.top - this.margin.bottom;
    }

    public getMargin(): ChartMargin {
        return this.margin;
    }

    public setMargin(margin: Partial<ChartMargin>): void {
        this.margin = { ...this.margin, ...margin };
        this.updateRanges();
        this.emit("margin-updated");
    }

    public getColor(metric: string): string {
        const index = this.metrics.indexOf(metric);
        return this.colors[index % this.colors.length];
    }

    public setColors(colors: string[]): void {
        this.colors = colors;
        this.emit("colors-updated");
    }

    public getActiveMetrics(): string[] {
        return this.activeMetrics;
    }

    public setActiveMetrics(metrics: string[]): void {
        this.activeMetrics = metrics;
        this.emit("active-metrics-updated");
    }

    public getXRange(): ChartRange {
        return this.xRange;
    }

    public getYRange(metric: string): ChartRange {
        return this.yRanges.get(metric) || { min: 0, max: 1 };
    }

    public getZoom(): ChartZoom {
        return this.zoom;
    }

    public setZoom(zoom: Partial<ChartZoom>): void {
        this.zoom = { ...this.zoom, ...zoom };
        this.emit("zoom-updated");
    }

    public getPan(): ChartPan {
        return this.pan;
    }

    public setPan(pan: Partial<ChartPan>): void {
        this.pan = { ...this.pan, ...pan };
        this.emit("pan-updated");
    }

    public getVisibleXRange(): ChartRange {
        const fullRange = this.getXRange();
        const visibleWidth = (fullRange.max - fullRange.min) / this.zoom.x;
        
        return {
            min: fullRange.min + this.pan.x,
            max: fullRange.min + this.pan.x + visibleWidth
        };
    }

    // ======== Data Methods ========
    
    public getData(): ChartPoint[] {
        return this.data;
    }

    public setData(data: ChartPoint[]): void {
        this.data = data;
        
        // Extract metrics from the data (excluding the x-axis field)
        this.metrics = Object.keys(data[0] || {}).filter(key => key !== "time");
        
        // If no active metrics are set, use all metrics
        if (this.activeMetrics.length === 0) {
            this.activeMetrics = [...this.metrics];
        }
        
        this.updateRanges();
        this.emit("data-updated");
    }

    public getMetrics(): string[] {
        return this.metrics;
    }

    // ======== Range Calculation ========
    
    private updateRanges(): void {
        if (this.data.length === 0) return;

        // Calculate X range
        const xValues = this.data.map(d => d.time);
        this.xRange = {
            min: Math.min(...xValues),
            max: Math.max(...xValues)
        };

        // Calculate Y range for each metric
        this.yRanges.clear();
        for (const metric of this.metrics) {
            const values = this.data.map(d => d[metric]);
            this.yRanges.set(metric, {
                min: 0, // Starting from zero is usually better for most charts
                max: Math.max(...values) * 1.05 // Add 5% padding on top
            });
        }
        
        this.emit("ranges-updated");
    }

    // ======== Size Methods ========
    
    public setSize(width: number, height: number): void {
        this.containerWidth = width;
        this.containerHeight = height;
        this.emit("size-updated");
    }

    public getSize(): ChartSize {
        return {
            width: this.containerWidth,
            height: this.containerHeight,
            plotWidth: this.getChartWidth(),
            plotHeight: this.getChartHeight()
        };
    }

    // ======== React Hooks ========
    
    public useEvent(event: string, callback: () => void): void {
        useEffect(() => {
            this.on(event, callback);
            return () => { this.off(event, callback) };
        }, []);
    }

    public useSize(): ChartSize | undefined {
        const [size, setSize] = useState<ChartSize | undefined>(undefined);
        
        useEffect(() => {
            const updateSize = () => {
                setSize(this.containerWidth && this.containerHeight ? this.getSize() : undefined)
            }

            this.on("size-updated", updateSize);
            this.on("margin-updated", updateSize);
            return () => {
                this.off("size-updated", updateSize);
                this.off("margin-updated", updateSize);
            };
        }, []);
        
        return size;
    }

    public useData(): ChartPoint[] {
        const [data, setData] = useState<ChartPoint[]>(this.data);
        
        useEffect(() => {
            const handleChange = () => setData(this.data);
            this.on("data-updated", handleChange);
            return () => this.off("data-updated", handleChange);
        }, []);
        
        return data;
    }

    public useMetrics(): string[] {
        const [metrics, setMetrics] = useState<string[]>(this.metrics);
        
        useEffect(() => {
            const handleChange = () => setMetrics(this.metrics);
            this.on("data-updated", handleChange);
            return () => this.off("data-updated", handleChange);
        }, []);
        
        return metrics;
    }

    public useActiveMetrics(): string[] {
        const [activeMetrics, setActiveMetrics] = useState<string[]>(this.activeMetrics);
        
        useEffect(() => {
            const handleChange = () => setActiveMetrics(this.activeMetrics);
            this.on("active-metrics-updated", handleChange);
            return () => this.off("active-metrics-updated", handleChange);
        }, []);
        
        return activeMetrics;
    }

    public useXRange(): ChartRange {
        const [range, setRange] = useState<ChartRange>(this.xRange);
        
        useEffect(() => {
            const handleChange = () => setRange(this.xRange);
            this.on("ranges-updated", handleChange);
            return () => this.off("ranges-updated", handleChange);
        }, []);
        
        return range;
    }

    public useYRange(metric: string): ChartRange {
        const [range, setRange] = useState<ChartRange>(
            this.yRanges.get(metric) || { min: 0, max: 1 }
        );
        
        useEffect(() => {
            const handleChange = () => setRange(this.yRanges.get(metric) || { min: 0, max: 1 });
            this.on("ranges-updated", handleChange);
            return () => this.off("ranges-updated", handleChange);
        }, [metric]);
        
        return range;
    }

    public useZoom(): ChartZoom {
        const [zoom, setZoom] = useState<ChartZoom>(this.zoom);
        
        useEffect(() => {
            const handleChange = () => setZoom(this.zoom);
            this.on("zoom-updated", handleChange);
            return () => this.off("zoom-updated", handleChange);
        }, []);
        
        return zoom;
    }

    public usePan(): ChartPan {
        const [pan, setPan] = useState<ChartPan>(this.pan);
        
        useEffect(() => {
            const handleChange = () => setPan(this.pan);
            this.on("pan-updated", handleChange);
            return () => this.off("pan-updated", handleChange);
        }, []);
        
        return pan;
    }
}