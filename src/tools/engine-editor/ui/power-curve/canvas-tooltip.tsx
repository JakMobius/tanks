import React from 'react';
import { CanvasPowerCurveManager } from './canvas-power-curve-manager';

interface CanvasTooltipProps {
    position: { x: number, y: number } | null;
    data: { rpm: number, torque: number, power: number } | null;
    manager: CanvasPowerCurveManager;
}

const CanvasTooltip: React.FC<CanvasTooltipProps> = ({ position, data, manager }) => {
    if (!position || !data) return null;

    return (
        <div
            className="power-curve-tooltip"
            style={{
                position: 'absolute',
                left: `${position.x + 10}px`,
                top: `${position.y - 60}px`,
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #ccc',
                padding: '6px',
                borderRadius: '3px',
                pointerEvents: 'none',
                zIndex: 10,
                fontSize: '11px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
            }}
        >
            <div><strong>RPM:</strong> {manager.formatRpm(data.rpm)}</div>
            <div style={{ color: '#4682B4' }}><strong>Torque:</strong> {manager.formatTorque(data.torque)}</div>
            <div style={{ color: '#FF5733' }}><strong>Power:</strong> {manager.formatPower(data.power)}</div>
        </div>
    );
};

export default CanvasTooltip;