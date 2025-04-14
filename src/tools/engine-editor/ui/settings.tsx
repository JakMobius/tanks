import React from "react";
import SettingInput from "./settings-input";
import GearSettings from "./gear-settings";
import { GearboxUnitConfig } from "src/entity/components/transmission/units/gearbox-unit";
import { EngineConfig } from "src/entity/components/transmission/units/tank-engine-unit";

interface SettingsWindowProps {
    engineConfig: EngineConfig;
    gearboxConfig: GearboxUnitConfig
    onEngineConfigChange: (updatedConfig: any) => void;
    onGearboxConfigChange: (updatedConfig: any) => void;
}

const SettingsWindow: React.FC<SettingsWindowProps> = ({
    engineConfig,
    gearboxConfig,
    onEngineConfigChange,
    onGearboxConfigChange,
}) => {
    return (
        <div style={{ width: "100%", height: "100%", overflow: "auto" }}>
            <div style={{ padding: "20px" }}>
                <h3>Engine Settings</h3>
                <SettingInput
                    label="Cutoff Engine Speed (rad/s)"
                    value={engineConfig.cutoffEngineSpeed}
                    onChange={(value) => onEngineConfigChange({ ...engineConfig, cutoffEngineSpeed: value })}
                />
                <SettingInput
                    label="Flywheel Momentum"
                    value={engineConfig.flywheelMomentum}
                    onChange={(value) => onEngineConfigChange({ ...engineConfig, flywheelMomentum: value })}
                />

                <h3>Gearbox Settings</h3>
                <SettingInput
                    label="Clutch Torque"
                    value={gearboxConfig.clutchTorque}
                    onChange={(value) => onGearboxConfigChange({ ...gearboxConfig, clutchTorque: value })}
                />
                <GearSettings
                    gears={gearboxConfig.gears}
                    onUpdate={(updatedGears) => onGearboxConfigChange({ ...gearboxConfig, gears: updatedGears })}
                />
            </div>
        </div>
    );
};

export default SettingsWindow;