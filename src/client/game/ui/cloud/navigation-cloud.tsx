
import Controller from "src/client/ui/controller/controller";
import { Constructor } from "src/utils/constructor";
import React, { useEffect, useRef } from "react";
import Cloud, { CloudProps } from "./cloud";
import NavigationTransition from "src/client/ui/navigation/navigation-transition";
import PauseNavigationTransition from "src/client/ui/overlay/pause-overlay/navigation/pause-navigation-transition";

interface NavigationCloudProps extends CloudProps {
    controller: Controller;
    target?: Constructor<Controller>;
    transition?: () => NavigationTransition
    onClick?: () => void
}

const NavigationCloud: React.FC<NavigationCloudProps> = (props) => {
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = elementRef.current;

        const handleClick = () => {
            if(props.target) {
                const target = new props.target();
                target.controlsResponder = props.controller.controlsResponder
                let transition = props.transition?.() || new PauseNavigationTransition();
                props.controller.navigationView.pushController(target, transition);
            }
            props.onClick?.();
        };

        if (element) {
            element.addEventListener("click", handleClick);
        }

        return () => {
            if (element) {
                element.removeEventListener("click", handleClick);
            }
        };
    }, [props.controller, props.target, props.onClick, props.transition]);

    return <Cloud
        ref={elementRef}
        customClass="navigation-cloud"
        {...props}
    ></Cloud>
};

export default NavigationCloud;