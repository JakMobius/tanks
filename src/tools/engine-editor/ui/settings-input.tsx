import React, { useState } from "react";

interface SettingInputProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
}

const SettingInput: React.FC<SettingInputProps> = ({ label, value, onChange }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [startY, setStartY] = useState(0);
    const [startValue, setStartValue] = useState(value);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartY(e.clientY);
        setStartValue(value);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
            const deltaY = startY - e.clientY;
            const newValue = startValue + deltaY * 0.1; // Adjust sensitivity as needed
            onChange(parseFloat(newValue.toFixed(2))); // Keep precision to 2 decimals
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    React.useEffect(() => {
        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        } else {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging]);

    return (
        <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>
                {label}
            </label>
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                onMouseDown={handleMouseDown}
                style={{
                    width: "100%",
                    padding: "5px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    cursor: "ns-resize", // Indicates draggable behavior
                }}
            />
        </div>
    );
};

export default SettingInput;