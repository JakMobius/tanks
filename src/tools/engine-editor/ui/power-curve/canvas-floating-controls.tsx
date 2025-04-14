import React, { useState, useRef, useEffect } from 'react';
import { CanvasPowerCurveManager } from './canvas-power-curve-manager';
import AutoResizableInput from './autoresizable-input';

const CanvasFloatingControls: React.FC<{
    manager: CanvasPowerCurveManager;
}> = ({ manager }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const position = useRef({ top: 10, left: 10 });
    const controlsRef = useRef<HTMLDivElement | null>(null);

    // Use hooks from manager to reactively update UI
    const maxRPM = manager.useMaxRPM();
    const maxTorque = manager.useMaxTorque();
    const maxPower = manager.useMaxPower();
    const maxPowerRpm = manager.useMaxPowerRpm();
    const maxTorquePoint = manager.useMaxTorquePoint();
    const powerUnit = manager.usePowerUnit();
    const torqueUnit = manager.useTorqueUnit();

    // Initialize values on mount
    useEffect(() => {
        manager.calculatePowerCurve();
    }, []);
    
    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            if (isDragging) {
                position.current.left = event.pageX + offset.x;
                position.current.top = event.pageY + offset.y;
                if (controlsRef.current) {
                    controlsRef.current.style.left = `${position.current.left}px`;
                    controlsRef.current.style.top = `${position.current.top}px`;
                }
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging, offset, position]);

    // Prevent mouse events from propagating through the menu to the canvas
    const stopPropagation = (e: React.MouseEvent) => {
        e.stopPropagation();
    };
    
    // Handle mousedown for the entire component
    const handleMouseDown = (event: React.MouseEvent) => {
        const target = event.target as HTMLElement;
        
        // Only prevent dragging if clicking directly on input elements
        if (target.tagName.toLowerCase() === "input" || 
            target.closest(".autoresizable-input-container") ||
            target.classList.contains("no-drag")) {
            // Just stop propagation without setting dragging
            stopPropagation(event);
            return;
        }
        
        // Otherwise allow dragging and stop propagation
        setIsDragging(true);
        setOffset({
            x: position.current.left - event.pageX,
            y: position.current.top - event.pageY,
        });
        event.preventDefault();
        stopPropagation(event);
    };

    return (
        <div
            ref={controlsRef}
            className="floating-controls"
            style={{
                position: "absolute",
                top: `${position.current.top}px`,
                left: `${position.current.left}px`,
                background: "white",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                zIndex: 100,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                fontSize: "11px",
                minWidth: "170px",
                cursor: isDragging ? "grabbing" : "grab",
                userSelect: "none",
                touchAction: "none"
            }}
            onMouseDown={handleMouseDown}
            onClick={stopPropagation}
            onContextMenu={(e) => e.preventDefault()}
        >
            <div className="control-group" style={{ marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                    <label htmlFor="max-rpm-input" style={{ marginRight: "10px" }}>Max RPM:</label>
                    <AutoResizableInput
                        id="max-rpm-input"
                        type="text"
                        value={maxRPM}
                        onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (!isNaN(value) && value > 0) {
                                manager.setMaxRPM(value);
                            }
                        }}
                        suffix="rpm"
                    />
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <label htmlFor="max-torque-input" style={{ marginRight: "10px" }}>Torque scale:</label>
                    <AutoResizableInput
                        id="max-torque-input"
                        type="text"
                        value={maxTorque}
                        onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (!isNaN(value) && value > 0) {
                                manager.setMaxTorque(value);
                            }
                        }}
                        suffix={torqueUnit}
                    />
                </div>
            </div>
            
            <div className="series-legend" style={{ 
                marginTop: "10px", 
                padding: "8px 0", 
                borderTop: "1px solid #eee"
            }}>
                <div className="legend-item" style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    marginBottom: "6px",
                    flexWrap: "wrap"
                }}>
                    <div style={{ display: "flex", alignItems: "center", marginRight: "8px" }}>
                        <span
                            style={{
                                width: "12px",
                                height: "12px",
                                backgroundColor: "rgba(70, 130, 180, 0.9)",
                                display: "inline-block",
                                marginRight: "5px",
                            }}
                        ></span>
                        <span>Torque</span>
                    </div>
                    {maxTorquePoint && (
                        <span style={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
                            {manager.formatTorque(maxTorquePoint.torque)} @ {manager.formatRpm(maxTorquePoint.rpm)}
                        </span>
                    )}
                </div>
                
                <div className="legend-item" style={{ 
                    display: "flex", 
                    alignItems: "center",
                    flexWrap: "wrap"
                }}>
                    <div style={{ display: "flex", alignItems: "center", marginRight: "8px" }}>
                        <span
                            style={{
                                width: "12px",
                                height: "2px",
                                backgroundColor: "#FF5733",
                                display: "inline-block",
                                marginRight: "5px",
                                marginBottom: "0",
                            }}
                        ></span>
                        <span>Power</span>
                    </div>
                    {maxPower > 0 && (
                        <span style={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
                            {manager.formatPower(maxPower)} @ {manager.formatRpm(maxPowerRpm)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CanvasFloatingControls;