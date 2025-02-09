import './pause-menu-view.scss'

import Controller from "src/client/ui/controller/controller";
import NavigationCloud from 'src/client/game/ui/cloud/navigation-cloud';
import PauseNavigationTransition from './navigation/pause-navigation-transition';

import React from 'react';
import { Constructor } from 'src/utils/constructor';

interface PauseMenuButtonProps {
    controller?: Controller
    target?: Constructor<Controller>;
    children?: React.ReactNode,
    blue?: boolean
    red?: boolean
    onClick?: () => void
}

export const PauseMenuButton: React.FC<PauseMenuButtonProps> = (props) => {
    return <NavigationCloud
                controller={props.controller}
                customClass="pause-menu-button"
                transition={() => new PauseNavigationTransition()}
                target={props.target}
                button
                blue={props.blue}
                red={props.red}
                onClick={props.onClick}
            > {props.children} </NavigationCloud>
}

interface PauseMenuSubtitleProps {
    children?: React.ReactNode
}

export const PauseMenuSubtitle: React.FC<PauseMenuSubtitleProps> = (props) => {
    return <div className="subtitle"> {props.children} </div>
}

export interface PauseMenuViewProps {
    children?: React.ReactNode
}

export const PauseMenuView: React.FC<PauseMenuViewProps> = (props) => {
    return <div className="pause-menu-view">
        {props.children}
    </div>
}