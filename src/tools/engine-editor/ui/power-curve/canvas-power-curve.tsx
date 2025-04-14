import React, { useRef, useEffect, useState } from "react";
import { CanvasPowerCurveManager } from "./canvas-power-curve-manager";
import CanvasFloatingControls from "./canvas-floating-controls";
import CanvasTooltip from "./canvas-tooltip";
import "./power-curve.scss";
import { TorquePoint } from "src/entity/components/transmission/units/tank-engine-unit";

interface CanvasPowerCurveProps {
  options?: {
    bars?: number;
    maxRPM?: number;
    maxTorque?: number;
  };
  onTorqueMapChanged?: (torqueMap: TorquePoint[]) => void;
}

const CanvasPowerCurve: React.FC<CanvasPowerCurveProps> = ({ options, onTorqueMapChanged }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Create a manager instance to handle state and calculations
  const managerRef = useRef<CanvasPowerCurveManager>(new CanvasPowerCurveManager({
    bars: options?.bars || 100,
    maxRPM: options?.maxRPM || 7000,
    maxTorque: options?.maxTorque || 500
  }));
  
  const manager = managerRef.current;
  
  // Listen for torque map changes and forward them to the parent component
  useEffect(() => {
    if (onTorqueMapChanged) {
      const handleTorqueMapChanged = (torqueMap: TorquePoint[]) => {
        onTorqueMapChanged(manager.getTorqueMapForEngine());
      };
      
      manager.on('changed', handleTorqueMapChanged);
      
      // Emit the initial torque map immediately when the component mounts
      onTorqueMapChanged(manager.getTorqueMapForEngine());
      
      return () => {
        manager.off('changed', handleTorqueMapChanged);
      };
    }
    return undefined
  }, [onTorqueMapChanged, manager]);
  
  // Get reactive values from the manager
  const showPowerCurve = manager.useShowPowerCurve();
  const showTorqueCurve = manager.useShowTorqueCurve();
  
  // Tooltip state
  const [tooltipPosition, setTooltipPosition] = React.useState<{ x: number; y: number } | null>(null);
  const [tooltipData, setTooltipData] = React.useState<{ rpm: number; torque: number; power: number } | null>(null);
  
  // Handle resize
  useEffect(() => {
    if (!containerRef.current) return undefined;
    
    const handleResize = () => {
      const containerWidth = containerRef.current?.clientWidth || 0;
      const containerHeight = containerRef.current?.clientHeight || 0;
      
      if (containerWidth > 0 && containerHeight > 0) {
        manager.setSize(containerWidth, containerHeight);
      }
    };
    
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);
    
    // Initial sizing
    handleResize();
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef, manager]);
  
  return (
    <div className="power-curve-editor" ref={containerRef}>
      <CanvasFloatingControls manager={manager} />
      <div className="canvas-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
        <PowerCurveCanvas 
          manager={manager} 
          onMouseMove={(position, data) => {
            setTooltipPosition(position);
            setTooltipData(data);
          }}
        />
        <CanvasTooltip position={tooltipPosition} data={tooltipData} manager={manager} />
      </div>
    </div>
  );
};

interface PowerCurveCanvasProps {
  manager: CanvasPowerCurveManager;
  onMouseMove?: (
    position: { x: number; y: number } | null, 
    data: { rpm: number; torque: number; power: number } | null
  ) => void;
}

const PowerCurveCanvas: React.FC<PowerCurveCanvasProps> = ({ manager, onMouseMove }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = manager.useSize();
  const showPowerCurve = manager.useShowPowerCurve();
  const showTorqueCurve = manager.useShowTorqueCurve();
  
  // Track mouse state for editing
  const [isEditing, setIsEditing] = useState(false);
  const lastIndex = useRef<number | null>(null);
  const previousMouseY = useRef<number | null>(null);
  
  // Track hover state for vertical line and dots
  const hoverPosition = useRef<{ x: number; y: number } | null>(null);
  const hoverData = useRef<{ rpm: number; torque: number; power: number } | null>(null);

  // Linear interpolation between values
  const interpolateValues = (startValue: number, endValue: number, steps: number) => {
    const values = [];
    for (let i = 0; i <= steps; i++) {
      values.push(startValue + (endValue - startValue) * (i / steps));
    }
    return values;
  };

  // Update a range of bars with interpolated values
  const updateBars = (start: number, end: number, startMouseY: number, endMouseY: number) => {
    // Determine if we're modifying full-throttle or coasting torque
    const isFullThrottle = startMouseY > 0;
    
    // Special case: if start and end are the same, just update that single bar
    if (start === end) {
      const mouseY = endMouseY; // Use the current mouse position
      if (isFullThrottle) {
        const normalizedValue = Math.max(0, Math.min(1, mouseY));
        manager.setTorquePoint(start, normalizedValue, true);
      } else {
        const normalizedValue = Math.max(0, Math.min(1, -mouseY));
        manager.setTorquePoint(start, normalizedValue, false);
      }
      return;
    }
    
    let normalizedStartValue, normalizedEndValue;
    
    if (isFullThrottle) {
      // For full throttle (top half), higher Y value = lower torque
      normalizedStartValue = Math.max(0, Math.min(1, startMouseY));
      normalizedEndValue = Math.max(0, Math.min(1, endMouseY));
    } else {
      // For coasting (bottom half), higher Y value = higher negative torque
      normalizedStartValue = Math.max(0, Math.min(1, -startMouseY));
      normalizedEndValue = Math.max(0, Math.min(1, -endMouseY));
    }

    const steps = Math.abs(end - start)
    const interpolatedValues = interpolateValues(normalizedStartValue, normalizedEndValue, steps);
    
    for (let i = 0; i <= steps; i++) {
        let position = start + (end - start) * (i / steps)
        manager.setTorquePoint(position, interpolatedValues[i], isFullThrottle);
    }
  };
  
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
    if (size) {
      drawChart();
    }
  }, [size, showPowerCurve, showTorqueCurve]);
  
  const handleMouseLeave = () => {
    if(isEditing) return
    // Reset interpolation state
    lastIndex.current = null;
    previousMouseY.current = null;
    
    // Clear hover state
    hoverPosition.current = null;
    hoverData.current = null;
    
    if (onMouseMove) {
      onMouseMove(null, null);
    }

    drawChart()
  };

  const handleMouseInteraction = (e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Only check if we're in bounds when starting the drag
    if (mouseX < 0 || mouseX > canvas.clientWidth || mouseY < 0 || mouseY > canvas.clientHeight) {
        return;
    }

    const margin = manager.getMargin();
    const size = manager.getSize()
    const barWidth = manager.getBarWidth(canvas.clientWidth);
    
    // Center-align calculation
    const hoveredIndex = Math.min(
        manager.getBars() - 1,
        Math.max(0, Math.round((mouseX - margin.left) / barWidth)) // Fix: use margin.left instead of getMargin()
    );

    let relativeMouseY = -((mouseY - margin.top) / size.plotHeight * 2 - 1);

    if (hoveredIndex >= 0 && hoveredIndex < manager.getBars()) {
        updateBars(
            lastIndex.current ?? hoveredIndex,
            hoveredIndex,
            previousMouseY.current ?? relativeMouseY,
            relativeMouseY);
        
        lastIndex.current = hoveredIndex;
        previousMouseY.current = relativeMouseY;
        drawChart();
    }
  };

  const handleDocumentMouseUp = (e: MouseEvent) => {
    setIsEditing(false);
    // Reset interpolation state
    lastIndex.current = null;
    previousMouseY.current = null;
    
    // Clean up document event listeners
    document.body.removeEventListener('mousemove', handleMouseInteraction);
    document.body.removeEventListener('mouseup', handleDocumentMouseUp);
    document.body.removeEventListener('mouseleave', handleDocumentMouseUp);
  };

  // Canvas-level mouse handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !size) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Check if mouse is within the plot area
    const margin = manager.getMargin();
    const plotWidth = size.plotWidth || 0;
    const plotHeight = size.plotHeight || 0;
    
    if (
      mouseX >= margin.left && 
      mouseX <= margin.left + plotWidth &&
      mouseY >= margin.top && 
      mouseY <= margin.top + plotHeight
    ) {
      setIsEditing(true);
      handleMouseInteraction(e.nativeEvent);
      
      // Add document-level event listeners
      document.body.addEventListener('mousemove', handleMouseInteraction);
      document.body.addEventListener('mouseup', handleDocumentMouseUp);
      document.body.addEventListener('mouseleave', handleDocumentMouseUp);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const margin = manager.getMargin();
    const plotWidth = size?.plotWidth || 0;
    const plotHeight = size?.plotHeight || 0;
    
    if (
      onMouseMove && 
      mouseX >= margin.left && 
      mouseX <= margin.left + plotWidth &&
      mouseY >= margin.top && 
      mouseY <= margin.top + plotHeight
    ) {
      const rpmRatio = (mouseX - margin.left) / plotWidth;
      const rpm = rpmRatio * manager.getMaxRPM();
      const data = manager.getDataAtRpm(rpm);
      
      // Update hover state
      hoverPosition.current = { x: mouseX, y: mouseY };
      hoverData.current = data;
      onMouseMove({ x: mouseX, y: mouseY }, data);
    } else if (onMouseMove) {
      // Clear hover state
      hoverPosition.current = null;
      hoverData.current = null;
      onMouseMove(null, null);
    }

    drawChart()
  };

  const drawChart = () => {
    const canvas = canvasRef.current;
    const size = manager.getSize()

    if (!canvas || !size) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
    
    const labelAreaHeight = 25; // Height of the label area at the bottom
        
    // Draw background grid
    drawGrid(ctx);
    
    // Draw torque bars if enabled
    if (showTorqueCurve) {
      drawTorqueBars(ctx);
    }
    
    // Calculate and draw power curve if enabled
    if (showPowerCurve) {
      drawPowerCurve(ctx);
    }
    
    // Draw vertical line and dots at intersection points if hovering
    if (hoverPosition && hoverData) {
      drawVerticalLineAndDots(ctx);
    }

    // Draw RPM scale
    drawRPMScale(ctx, labelAreaHeight);
  };
  
  const drawGrid = (
    ctx: CanvasRenderingContext2D,
  ) => {
    const margin = manager.getMargin();
    const { plotWidth, plotHeight } = manager.getSize()
    
    ctx.strokeStyle = "#eee";
    ctx.lineWidth = 1;
    
    // Draw horizontal grid lines
    const ySteps = 10;
    for (let i = 0; i <= ySteps; i++) {
      const y = margin.top + (i / ySteps) * plotHeight;
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + plotWidth, y);
      ctx.stroke();
    }
    
    // Draw vertical grid lines
    const xSteps = 10;
    for (let i = 0; i <= xSteps; i++) {
      const x = margin.left + (i / xSteps) * plotWidth;
      ctx.beginPath();
      ctx.moveTo(x, margin.top);
      ctx.lineTo(x, margin.top + plotHeight);
      ctx.stroke();
    }
    
    // Draw a subtle y=0 (center) line
    const zeroY = margin.top + plotHeight / 2;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(margin.left, zeroY);
    ctx.lineTo(margin.left + plotWidth, zeroY);
    ctx.stroke();
  };
  
  const drawRPMScale = (
    ctx: CanvasRenderingContext2D,
    labelAreaHeight: number
  ) => {
    const { plotWidth, plotHeight } = manager.getSize()
    const margin = manager.getMargin()

    // Draw a solid background for the label area
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(0, margin.top + plotHeight - labelAreaHeight, plotWidth + margin.left + margin.right, labelAreaHeight);
    
    // Draw stronger horizontal line at the bottom of the chart area
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, margin.top + plotHeight - labelAreaHeight);
    ctx.lineTo(margin.left + plotWidth, margin.top + plotHeight - labelAreaHeight);
    ctx.stroke();
    
    // Draw RPM scale
    ctx.fillStyle = "black";
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    
    const maxRPM = manager.getMaxRPM();
    const rpmSteps = 5;
    
    for (let i = 0; i <= rpmSteps; i++) {
      const rpm = (i / rpmSteps) * maxRPM;
      const x = margin.left + (i / rpmSteps) * plotWidth;
      
      // Draw stronger vertical guides
      ctx.strokeStyle = i % rpmSteps === 0 ? "#ccc" : "#ddd";
      ctx.lineWidth = i % rpmSteps === 0 ? 1 : 0.5;
      ctx.beginPath();
      ctx.moveTo(x, margin.top);
      ctx.lineTo(x, margin.top + plotHeight - labelAreaHeight);
      ctx.stroke();
      
      // Draw tick mark
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, margin.top + plotHeight - labelAreaHeight);
      ctx.lineTo(x, margin.top + plotHeight - labelAreaHeight + 5);
      ctx.stroke();
      
      // Draw label
      ctx.fillText(`${rpm.toFixed(0)}`, x, margin.top + plotHeight - 8);
    }
    
    // Add RPM label
    ctx.fillText("RPM", margin.left + plotWidth / 2, margin.top + plotHeight - 8);
  };
  
  const drawTorqueBars = (
    ctx: CanvasRenderingContext2D,
  ) => {
    const fullThrottleTorquePoints = manager.getFullThrottleTorquePoints();
    const coastingTorquePoints = manager.getCoastingTorquePoints();
    const bars = manager.getBars();
    const margin = manager.getMargin();
    const { plotWidth, plotHeight } = manager.getSize()
    const zeroY = margin.top + plotHeight / 2;
    const barWidth = manager.getBarWidth(plotWidth + margin.left + margin.right);
    
    // Add gap between bars (reduce bar width by 20%)
    const gapFactor = 0.8;
    const actualBarWidth = barWidth * gapFactor;
    
    for (let i = 0; i < bars; i++) {
      const fullThrottleTorque = fullThrottleTorquePoints[i];
      const coastingTorque = coastingTorquePoints[i];
      
      const fullThrottleBarHeight = fullThrottleTorque * plotHeight / 2;
      const coastingBarHeight = coastingTorque * plotHeight / 2;
      
      // Center the bars on grid lines
      const x = margin.left + i * barWidth + barWidth / 2;
      
      // Full throttle torque - draw starting exactly at the center line (zeroY)
        ctx.fillStyle = "rgba(173, 216, 230, 0.7)"; // lightblue with transparency
        ctx.fillRect(
          x - actualBarWidth / 2, 
          zeroY - fullThrottleBarHeight, 
          actualBarWidth, 
          fullThrottleBarHeight
        );
            
      // Coasti torque - draw starting exactly at the center line (zeroY)
        ctx.fillStyle = "rgba(240, 128, 128, 0.7)"; // lightcoral with transparency
        ctx.fillRect(
          x - actualBarWidth / 2, 
          zeroY, 
          actualBarWidth, 
          coastingBarHeight
        );
      }
        
    // Draw max torque point
    manager.calculatePowerCurve();
    const maxTorquePoint = manager.getMaxTorquePoint();
    
    if (maxTorquePoint) {
      const x = margin.left + (maxTorquePoint.rpm / manager.getMaxRPM()) * plotWidth;
      const y = zeroY - (maxTorquePoint.torque / manager.getMaxTorque()) * plotHeight / 2;
      
      ctx.fillStyle = "rgba(70, 130, 180, 0.9)"; // SteelBlue
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fill();
      
      // Add a vertical line at max torque RPM
      ctx.strokeStyle = "rgba(70, 130, 180, 0.3)"; // Semi-transparent blue
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, margin.top);
      ctx.lineTo(x, margin.top + plotHeight);
      ctx.stroke();
    }
  };
  
  const drawPowerCurve = (ctx: CanvasRenderingContext2D) => {
    // Recalculate power curve
    const bars = manager.getBars();
    const margin = manager.getMargin();
    const { plotWidth, plotHeight } = manager.getSize()
    const zeroY = margin.top + plotHeight / 2;
    const barWidth = manager.getBarWidth(plotWidth + margin.left + margin.right);
    const powerPoints: { x: number; y: number; power: number; rpm: number }[] = [];
    
    // Calculate power points and find max power
    for (let i = 0; i < bars; i++) {
      const rpm = (i / (bars - 1)) * manager.getMaxRPM();
      const data = manager.getDataAtRpm(rpm);
      
      const x = margin.left + i * barWidth + barWidth / 2;
      powerPoints.push({
        x,
        y: 0, // Will calculate after we know max power
        power: data.power,
        rpm
      });
    }
    
    // Find max power to normalize
    const maxPower = powerPoints.reduce((max, point) => Math.max(max, point.power), 0);
    
    // Calculate y positions based on max power
    for (let i = 0; i < powerPoints.length; i++) {
      const normalizedPower = powerPoints[i].power / (maxPower || 1); // Avoid division by zero
      // Scale to fit in top half of chart with slight margin
      powerPoints[i].y = zeroY - (normalizedPower * plotHeight / 2);
    }
    
    // Draw power curve
    ctx.strokeStyle = "#FF5733"; // Orange-red color
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    
    if (powerPoints.length > 0) {
      ctx.moveTo(powerPoints[0].x, powerPoints[0].y);
      for (let i = 1; i < powerPoints.length; i++) {
        ctx.lineTo(powerPoints[i].x, powerPoints[i].y);
      }
      ctx.stroke();
    }
    
    // Add a dot at the maximum power point
    const maxPowerPoint = powerPoints.reduce(
      (max, point) => (point.power > max.power ? point : max),
      powerPoints[0]
    );
    
    if (maxPowerPoint) {
      ctx.fillStyle = "#FF5733";
      ctx.beginPath();
      ctx.arc(maxPowerPoint.x, maxPowerPoint.y, 5, 0, 2 * Math.PI);
      ctx.fill();
      
      // Add a vertical line at max power RPM
      ctx.strokeStyle = "rgba(255, 87, 51, 0.3)"; // Semi-transparent orange-red
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(maxPowerPoint.x, margin.top);
      ctx.lineTo(maxPowerPoint.x, margin.top + plotHeight);
      ctx.stroke();
    }
  };
  
  // Draw vertical line with intersection dots
  const drawVerticalLineAndDots = (
    ctx: CanvasRenderingContext2D,
  ) => {
    // No need to draw if we don't have data
    if (!hoverData.current) return;

    const mouseX = hoverPosition.current.x
    const margin = manager.getMargin();
    const { plotWidth, plotHeight } = manager.getSize()
    // Calculate the exact centerline position
    const zeroY = margin.top + plotHeight / 2;
    
    // Draw vertical line at the exact mouseX position
    ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 2]); // Dashed line
    ctx.beginPath();
    ctx.moveTo(mouseX, margin.top);
    ctx.lineTo(mouseX, margin.top + plotHeight);
    ctx.stroke();
    ctx.setLineDash([]); // Reset to solid line
    
    // Calculate the exact RPM based on the current mouse position
    const rpmRatio = (mouseX - margin.left) / plotWidth;
    const rpm = rpmRatio * manager.getMaxRPM();
    
    // Get data at this RPM - this ensures we use the exact same data/scaling as the chart
    const preciseData = manager.getDataAtRpm(rpm);
    
    // Draw power dot
    if (showPowerCurve && preciseData.power > 0) {
      // Calculate max power for normalization, matching the curve drawing logic
      manager.calculatePowerCurve();
      const maxPower = manager.getMaxPower();
      const normalizedPower = preciseData.power / (maxPower || 1); // Avoid division by zero
      
      // Calculate the exact Y position using the same logic as in drawPowerCurve
      const powerY = zeroY - (normalizedPower * plotHeight / 2);
      
      // Draw outer white circle for contrast
      ctx.beginPath();
      ctx.arc(mouseX, powerY, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "white";
      ctx.fill();
      
      // Draw colored circle
      ctx.beginPath();
      ctx.arc(mouseX, powerY, 3.5, 0, 2 * Math.PI);
      ctx.fillStyle = "#FF5733"; // Orange-red, same as power curve
      ctx.fill();
    }
    
    // Draw torque dot
    if (showTorqueCurve && preciseData.torque > 0) {
      // Use the exact same scaling formula as used for the bars
      const torqueNormalized = preciseData.torque / manager.getMaxTorque();
      const torqueY = zeroY - torqueNormalized * plotHeight / 2;
      
      // Draw outer white circle for contrast
      ctx.beginPath();
      ctx.arc(mouseX, torqueY, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "white";
      ctx.fill();
      
      // Draw colored circle
      ctx.beginPath();
      ctx.arc(mouseX, torqueY, 3.5, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(70, 130, 180, 0.9)"; // SteelBlue, same as max torque point
      ctx.fill();
    }
  };
  
  return (
    <canvas
      ref={canvasRef}
      className="torque-curve-canvas"
      style={{ width: "100%", height: "100%" }}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseLeave={handleMouseLeave}
    />
  );
};

export default CanvasPowerCurve;