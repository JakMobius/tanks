import './pause-menu-view.scss'

import NavigationCloud from 'src/client/game/ui/cloud/navigation-cloud';
import PauseNavigationTransition from './navigation/pause-navigation-transition';

import React from 'react';
import Cloud from 'src/client/game/ui/cloud/cloud';
import { NavigationItem, NavigationItemProps, useNavigation } from '../../navigation/basic-navigation-view';

interface PauseMenuButtonProps {
    target?: React.ReactNode;
    children?: React.ReactNode,
    blue?: boolean
    red?: boolean
    onClick?: () => void
}

export const PauseMenuButton: React.FC<PauseMenuButtonProps> = (props) => {
    return <NavigationCloud
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

export const PauseNavigationItem: React.FC<NavigationItemProps> = (props) => {
    const navigation = useNavigation()

    let previousNavigationItemName = navigation.stack[navigation.stack.length - 1]?.context?.title

    return (
        <NavigationItem {...{...props, children: undefined}}>
            <div className="pause-menu-view">
                <div className="pause-menu-header">
                    <div className="pause-menu-header-item">
                        <Cloud leftArrowed button onClick={() => navigation.pop()} customClass="pause-menu-header-cloud">
                            {previousNavigationItemName ?? "Назад"}
                        </Cloud>
                    </div>
                </div>
                {props.children}
            </div>
        </NavigationItem>
    )
}