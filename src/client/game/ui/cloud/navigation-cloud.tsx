
import Controller from "src/client/ui/controller/controller";
import { Constructor } from "src/utils/constructor";
import React, { useEffect, useRef } from "react";
import Cloud, { CloudComponent, CloudProps } from "./cloud";
import ReactDOM from "react-dom/client";
import NavigationTransition from "src/client/ui/navigation/navigation-transition";
import PauseNavigationTransition from "src/client/ui/overlay/pause-overlay/navigation/pause-navigation-transition";

interface NavigationCloudProps extends CloudProps {
    controller: Controller;
    ControllerClass: Constructor<Controller>;
    clickHandlers?: Array<() => void>;
    transition?: () => NavigationTransition
}

export const NavigationCloudComponent: React.FC<NavigationCloudProps> = (props) => {
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = elementRef.current;

        const handleClick = () => {
            const target = new props.ControllerClass();
            target.controlsResponder = props.controller.controlsResponder
            let transition = props.transition?.() || new PauseNavigationTransition();
            props.controller.navigationView.pushController(target, transition);
            if (props.clickHandlers) {
                props.clickHandlers.forEach(handler => handler());
            }
        };

        if (element) {
            element.addEventListener("click", handleClick);
        }

        return () => {
            if (element) {
                element.removeEventListener("click", handleClick);
            }
        };
    }, [props.controller, props.ControllerClass, props.clickHandlers, props.transition]);

    return <CloudComponent
        ref={elementRef}
        customClass="navigation-cloud"
        {...props}
    ></CloudComponent>
};

export default class NavigationCloud extends Cloud {

    props: NavigationCloudProps

    constructor(controller: Controller) {
        super();
        this.props.controller = controller
    }

    renderReactComponent() {
        this.root.render(<NavigationCloudComponent {...this.props} />);
    }

    target(ControllerClass: Constructor<Controller>) {
        this.props.ControllerClass = ControllerClass;
        this.renderReactComponent()
        return this;
    }

    transition(transition: () => NavigationTransition) {
        this.props.transition = transition;
        this.renderReactComponent()
        return this;
    }

    click(callback: () => void) {
        if (!this.props.clickHandlers) {
            this.props.clickHandlers = [];
        }
        this.props.clickHandlers.push(callback);
        this.renderReactComponent()
        return this;
    }
}