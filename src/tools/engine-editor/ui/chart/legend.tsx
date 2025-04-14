import React, { useEffect, useRef, useState } from "react";

interface LegendProps {
    metrics: string[];
    activeMetrics: string[];
    getColor: (metric: string) => string;
    onToggle: (metric: string) => void;
    onHover?: (metric: string | null) => void;
}

const Legend: React.FC<LegendProps> = ({ 
    metrics, 
    activeMetrics, 
    getColor, 
    onToggle, 
    onHover 
}) => {
    const legendRef = useRef<HTMLDivElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const position = useRef({ top: 10, left: 10 });

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            if (isDragging) {
                position.current.left = event.pageX + offset.x;
                position.current.top = event.pageY + offset.y;
                if (legendRef.current) {
                    legendRef.current.style.left = `${position.current.left}px`;
                    legendRef.current.style.top = `${position.current.top}px`;
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

    return (
        <div
            ref={legendRef}
            className="legend"
            style={{
                display: "flex",
                flexDirection: "column",
                position: "absolute",
                top: `${position.current.top}px`,
                left: `${position.current.left}px`,
                background: "white",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                zIndex: 9,
                cursor: "move",
            }}
            onMouseDown={(event) => {
                if ((event.target as HTMLElement).tagName !== "INPUT") {
                    setIsDragging(true);
                    setOffset({
                        x: position.current.left - event.pageX,
                        y: position.current.top - event.pageY,
                    });
                    event.preventDefault();
                }
            }}
        >
            {metrics.map((metric) => (
                <div
                    key={metric}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "5px",
                    }}
                    onMouseEnter={() => onHover?.(metric)}
                    onMouseLeave={() => onHover?.(null)}
                >
                    <input
                        type="checkbox"
                        checked={activeMetrics.includes(metric)}
                        onChange={() => onToggle(metric)}
                    />
                    <span
                        style={{
                            width: "12px",
                            height: "12px",
                            backgroundColor: getColor(metric),
                            display: "inline-block",
                            marginRight: "5px",
                        }}
                    ></span>
                    <span>{metric.charAt(0).toUpperCase() + metric.slice(1)}</span>
                </div>
            ))}
        </div>
    );
};

export default Legend;