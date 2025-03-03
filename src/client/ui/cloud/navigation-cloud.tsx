
import React from "react";
import Cloud, { CloudProps } from "./cloud";
import { useNavigation } from "src/client/ui/navigation/navigation-view";

interface NavigationCloudProps extends CloudProps {
    target?: React.ReactNode;
}

const NavigationCloud: React.FC<NavigationCloudProps> = (props) => {
    const navigation = useNavigation()

    const handleClick = () => {
        if(props.target) {
            navigation.push(props.target)
        }
        props.onClick?.();
    };
{}
    return <Cloud
        {...props}
        onClick={handleClick}
    ></Cloud>
};

export default NavigationCloud;