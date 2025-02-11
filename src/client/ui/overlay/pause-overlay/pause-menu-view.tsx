import './pause-menu-view.scss'

import NavigationCloud from 'src/client/game/ui/cloud/navigation-cloud';

import React from 'react';
import Cloud from 'src/client/game/ui/cloud/cloud';
import { NavigationItem, NavigationItemProps, useNavigation, useNavigationItem } from '../../navigation/navigation-view';

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
    const navigationItem = useNavigationItem()

    return (
        <NavigationItem {...{...props, children: undefined}}>
            <div className="pause-menu-view">
                <div className="pause-menu-header">
                    <div className="pause-menu-header-item">
                        <Cloud leftArrowed={navigationItem.depth > 0} button onClick={() => navigation.pop()} customClass="pause-menu-header-cloud">
                            {props.title ?? "Назад"}
                        </Cloud>
                    </div>
                </div>
                <div className="pause-menu-content">
                    {props.children}
                </div>
            </div>
        </NavigationItem>
    )
}