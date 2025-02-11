
import React, { useEffect, useRef } from "react";
import Cloud, { CloudProps } from "./cloud";
import NavigationTransition from "src/client/ui/navigation/navigation-transition";
import { useNavigation } from "src/client/ui/navigation/basic-navigation-view";

interface NavigationCloudProps extends CloudProps {
    target?: React.ReactNode;
    transition?: () => NavigationTransition
    onClick?: () => void
}

const NavigationCloud: React.FC<NavigationCloudProps> = (props) => {
    const elementRef = useRef<HTMLDivElement>(null);
    const navigation = useNavigation()

    const handleClick = () => {
        if(props.target) {
            navigation.push(props.target)
        }
        props.onClick?.();
    };

    return <Cloud
        ref={elementRef}
        onClick={handleClick}
        customClass="navigation-cloud"
        {...props}
    ></Cloud>
};

export default NavigationCloud;