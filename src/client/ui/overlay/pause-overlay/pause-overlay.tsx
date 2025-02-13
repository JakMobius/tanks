
import Overlay from "src/client/ui/overlay/overlay";
import RootControlsResponder, {ControlsResponder} from "src/client/controls/root-controls-responder";
import ReactDOM from "react-dom/client";
import React, { useEffect } from "react";
import { NavigationProvider, useNavigation } from '../../navigation/navigation-view';
import NavigationEscapeHandler from "../../navigation/navigation-escape-handler";

export interface PauseOverlayConfig {
    rootComponent: React.ReactNode,
    gameControls: ControlsResponder
}

export default class PauseOverlay extends Overlay {

    rootComponent: React.ReactNode
    pauseControlsResponder = new ControlsResponder()
    gameControlsResponder: ControlsResponder
    
    reactRoot: ReactDOM.Root

    constructor(options: PauseOverlayConfig) {
        super();

        this.element.addClass("pause-overlay")

        this.gameControlsResponder = options.gameControls
        this.rootComponent = options.rootComponent

        this.gameControlsResponder.on("game-pause", () => this.show())
    }

    show(): boolean {
        if (super.show()) {
            RootControlsResponder.getInstance().setMainResponderDelayed(this.pauseControlsResponder)
            this.element.addClass("shown")
            this.reactRoot = ReactDOM.createRoot(this.element[0])
            this.reactRoot.render(
                <NavigationProvider
                    onClose={() => this.hide()}
                    rootComponent={this.rootComponent}
                >
                    <NavigationEscapeHandler controls={this.pauseControlsResponder}/>
                </NavigationProvider>
            )
            return true
        }
        return false
    }

    hide(): boolean {
        if (super.hide()) {
            RootControlsResponder.getInstance().setMainResponderDelayed(this.gameControlsResponder)
            this.element.removeClass("shown")

            this.reactRoot.unmount()
            return true
        }
        return false
    }
}