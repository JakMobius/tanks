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
    disabled?: boolean
    onClick?: () => void
}

export const PauseMenuButton: React.FC<PauseMenuButtonProps> = (props) => {
    return <NavigationCloud
                className="pause-menu-button"
                target={props.target}
                button={!props.disabled}
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

export interface PauseNavigationItemProps extends NavigationItemProps {
    rightNavigationItem?: React.ReactNode
}

export interface CloudyNavigationHeaderProps {
    rightNavigationItem?: React.ReactNode
    title?: string
}

export const CloudyNavigationHeader: React.FC<CloudyNavigationHeaderProps> = (props) => {
    const navigation = useNavigation()
    const navigationItem = useNavigationItem()

    return (
        <div className="cloudy-navigation-header">
            <Cloud leftArrowed={navigationItem.depth > 0} button onClick={() => navigation.pop()} className="cloudy-navigation-header-item">
                {props.title ?? "Назад"}
            </Cloud>
            {props.rightNavigationItem}
        </div>
    )
}

export const PauseNavigationItem: React.FC<PauseNavigationItemProps> = (props) => {
    return (
        <NavigationItem {...{...props, children: undefined}}>
            <div className="pause-menu-view">
                <CloudyNavigationHeader title={props.title} rightNavigationItem={props.rightNavigationItem} />
                <div className="pause-menu-content">
                    {props.children}
                </div>
            </div>
        </NavigationItem>
    )
}