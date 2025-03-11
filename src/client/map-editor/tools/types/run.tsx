import Tool from '../tool';
import * as Box2D from "@box2d/core";
import KeyboardController from '../../../controls/input/keyboard/keyboard-controller';
import ToolManager from "../toolmanager";
import TankControls from "src/controls/tank-controls";
import RootControlsResponder from "src/client/controls/root-controls-responder";
import Entity from "src/utils/ecs/entity";
import React, { useEffect, useState } from 'react';
import { ToolViewProps } from '../../../ui/tool-settings/tool-settings-view';
import TransformComponent from 'src/entity/components/transform/transform-component';
import SniperTankPrefab from 'src/entity/types/tank-sniper/server-prefab';

const RunToolView: React.FC<ToolViewProps<RunTool>> = (props) => {
    
    const [state, setState] = useState({})

    const onRunClick = () => {
        props.tool.toggle()
    }

    const onLocationClick = () => {
        props.tool.toggleSelectLocation()
    }

    const onToolUpdate = () => setState({})
    
    useEffect(() => {
        const tool = props.tool

        tool.on("running-changed", onToolUpdate)
        tool.on("location-selection-changed", onToolUpdate)

        return () => {
            tool.off("running-changed", onToolUpdate)
            tool.off("location-selection-changed", onToolUpdate)
        }
    }, [props.tool])

    return (
        <div className="tool-preferences">
            <div
                className={"tool " + (props.tool.selectingLocation ? "selected" : "")}
                style={{ backgroundImage: "url(static/map-editor/locate.png)" }}
                onClick={onLocationClick}
            />
            <div
                className={"tool " + (props.tool.running ? "selected" : "")}
                style={{ backgroundImage: "url(static/map-editor/start.png)" }}
                onClick={onRunClick}
            />
        </div>
    )
}

export default class RunTool extends Tool {
	public selectingLocation: boolean;
	public tank: Entity;
	public keyboard: KeyboardController;
	public running: boolean;
    private spawnPoint = new Box2D.b2Vec2(10, 10)

    constructor(manager: ToolManager) {
        super(manager);

        this.image = "static/map-editor/tank.png"
        this.selectingLocation = false
        this.settingsView = RunToolView

        this.keyboard = new KeyboardController()
    }

    toggle() {
        this.running = !this.running
        if(this.running) {
            this.onRun()
        } else {
            this.onStop()
        }
    }

    onRun() {
        this.manager.setNeedsRedraw()
        this.manager.setWorldAlive(true)
        // this.manager.setCameraMovementEnabled(false)

        // TODO: Setup an embedded server to run the game on
        // Client-only implementation limits the game functionality a lot

        this.tank = new Entity()
        SniperTankPrefab.prefab(this.tank)
        this.manager.world.appendChild(this.tank)
        
        this.tank.getComponent(TransformComponent).setGlobal({
            position: this.spawnPoint,
            angle: 0
        })
        RootControlsResponder.getInstance().connectTankControls(this.tank.getComponent(TankControls))

        // this.manager.camera.inertial = true
        // this.manager.camera.target = physicalComponent.body.GetPosition()
        // this.manager.camera.targetVelocity = physicalComponent.body.GetLinearVelocity()

        this.emit("running-changed", true)
    }

    onStop() {
        this.manager.setWorldAlive(false)
        // this.manager.setCameraMovementEnabled(true)

        this.tank.removeFromParent()

        RootControlsResponder.getInstance().disconnectTankControls(this.tank.getComponent(TankControls))

        // this.manager.camera.target = this.manager.camera.getPosition()
        // this.manager.camera.shaking.Set(0, 0)
        // this.manager.camera.shakeVelocity.Set(0, 0)
        // this.manager.camera.inertial = false

        this.emit("running-changed", false)
    }

    toggleSelectLocation() {
        this.selectingLocation = !this.selectingLocation
        this.emit("location-selection-changed", this.selectingLocation)
    }

    becomeActive() {
        super.becomeActive();
        this.manager.setNeedsRedraw()
    }

    resignActive() {
        super.resignActive();
        this.manager.setNeedsRedraw()

        if(this.running) {
            this.onStop()
        }
    }

    mouseDown(x: number, y: number) {
        super.mouseDown(x, y);

        if(this.selectingLocation) {
            this.toggleSelectLocation()
            this.spawnPoint.Set(x, y)
        }
    }
}