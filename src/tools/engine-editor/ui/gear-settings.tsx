import React from "react";
import SettingInput from "./settings-input";
import { EngineGearConfig } from "src/entity/components/transmission/units/gearbox-unit";

interface GearSettingsProps {
    gears: EngineGearConfig[];
    onUpdate: (updatedGears: EngineGearConfig[]) => void;
}

const GearSettings: React.FC<GearSettingsProps> = ({ gears, onUpdate }) => {
    const updateGear = (index: number, key: keyof EngineGearConfig, value: number) => {
        const updatedGears = [...gears];
        updatedGears[index][key] = value;
        onUpdate(updatedGears);
    };

    return (
        <div>
            <h4>Gears</h4>
            {gears.map((gear, index) => (
                <div key={index} style={{ marginBottom: "15px", padding: "10px", border: "1px solid #ddd", borderRadius: "5px" }}>
                    <h5>Gear {index + 1}</h5>
                    <SettingInput
                        label="Low (RPM)"
                        value={gear.low || 0}
                        onChange={(value) => updateGear(index, "low", value)}
                    />
                    <SettingInput
                        label="High (RPM)"
                        value={gear.high}
                        onChange={(value) => updateGear(index, "high", value)}
                    />
                    <SettingInput
                        label="Gearing"
                        value={gear.gearing}
                        onChange={(value) => updateGear(index, "gearing", value)}
                    />
                </div>
            ))}
        </div>
    );
};

export default GearSettings;