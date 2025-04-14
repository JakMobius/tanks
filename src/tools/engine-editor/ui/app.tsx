import React, { useMemo, useState, useCallback, useRef } from "react";
import ReactDOM from "react-dom/client";
import { Layout, Model, TabNode, BorderNode, IJsonModel } from "flexlayout-react";
import "flexlayout-react/style/light.css";
import "@blueprintjs/core/lib/css/blueprint.css";

import './main.css'

import CanvasChartWrapper from "./chart/canvas-chart-wrapper";
import CanvasPowerCurve from "./power-curve/canvas-power-curve";
import { dyno } from "./dyno";
import SettingsWindow from "./settings";
import { siValueFromRPM } from "src/utils/utils";
import { EngineConfig, TorquePoint } from "src/entity/components/transmission/units/tank-engine-unit";
import { GearboxUnitConfig } from "src/entity/components/transmission/units/gearbox-unit";
import GamePreviewComponent from "./game-preview/game-preview";

export type ViewId = 'chart' | 'settings' | 'curve';

// Create FlexLayout JSON model configuration
const layoutJson: IJsonModel = {
  global: {
    splitterSize: 4,
    tabEnableClose: false,
    tabSetEnableDrop: true,
    tabSetEnableDrag: true,
    tabSetEnableMaximize: true,
  },
  borders: [],
  layout: {
    type: "row",
    weight: 100,
    children: [
      {
        type: "tabset",
        weight: 60,
        children: [
          {
            type: "tab",
            name: "Chart",
            component: "chart",
            id: "chart"
          }, {
            type: "tab",
            name: "Game Preview",
            component: "game-preview",
            id: "game-preview"
          }
        ]
      },
      {
        type: "row",
        weight: 40,
        children: [
          {
            type: "tabset",
            weight: 50,
            children: [
              {
                type: "tab",
                name: "Settings",
                component: "settings",
                id: "settings"
              }
            ]
          },
          {
            type: "tabset",
            weight: 50,
            children: [
              {
                type: "tab",
                name: "Power Curve",
                component: "curve",
                id: "curve"
              }
            ]
          }
        ]
      }
    ]
  }
};

const App: React.FC = () => {
  const [engineConfig, setEngineConfig] = useState({
    cutoffEngineSpeed: siValueFromRPM(5000),
    flywheelMomentum: 0.5,
  } as EngineConfig);

  const [gearboxConfig, setGearboxConfig] = useState({
    gears: [
      { high: siValueFromRPM(4200), gearing: 70 },
      { low: siValueFromRPM(2500), high: siValueFromRPM(4200), gearing: 40 },
      { low: siValueFromRPM(2500), high: siValueFromRPM(4200), gearing: 28 },
      { low: siValueFromRPM(2500), high: siValueFromRPM(4200), gearing: 23 },
    ],
    clutchTorque: 900
  } as GearboxUnitConfig);

  let animationFrameId = useRef<number | null>(null);
  const layoutModel = useMemo(() => Model.fromJson(layoutJson), []);

  // Handle torque map changes from the power curve component
  const handleTorqueMapChanged = useCallback((torqueMap: TorquePoint[]) => {
    console.log(torqueMap)
    if (animationFrameId.current === null) {
      animationFrameId.current = requestAnimationFrame(() => {
        setEngineConfig(prev => ({
          ...prev,
          torqueMap
        }));
        animationFrameId.current = null;
      });
    }
  }, []);

  const measurements = useMemo(() => {
    return dyno(engineConfig, gearboxConfig);
  }, [engineConfig, gearboxConfig]);

  // Factory function to render the content based on component type
  const factory = (node: TabNode) => {
    const component = node.getComponent();

    switch (component) {
      case 'chart':
        return <CanvasChartWrapper data={measurements} />;
      case 'settings':
        return (
          <SettingsWindow
            engineConfig={engineConfig}
            gearboxConfig={gearboxConfig}
            onEngineConfigChange={setEngineConfig}
            onGearboxConfigChange={setGearboxConfig}
          />
        );
      case 'curve':
        return <CanvasPowerCurve onTorqueMapChanged={handleTorqueMapChanged} />;
      case 'game-preview':
        return <GamePreviewComponent engineConfig={engineConfig} gearboxConfig={gearboxConfig} />
      default:
        return <div>Unknown component: {component}</div>;
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Layout
        model={layoutModel}
        factory={factory}
      />
    </div>
  );
};

window.onload = () => {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      // <React.StrictMode>
      <App />
      // </React.StrictMode>
    );
  }
}