import './hub-page.scss'

import {UserDataRaw} from "src/client/utils/user-data-raw";

import React from 'react';
import { NavigationProvider } from 'src/client/ui/navigation/navigation-view';
import MainMenuView from './main-menu/main-menu';

const HubPageNavigationWrapper: React.FC<{children: React.ReactNode}> = ({ children }) => {
    return (
        <div className="navigation-block">
            {children}
        </div>
    )
}

interface HubPageProps {
    userData: UserDataRaw
}

const HubPageComponent: React.FC<HubPageProps> = (props) => {
    return (
        <div className="hub-body">
            <div className="dimmer"></div>
            <div className="navigation-view">
                <NavigationProvider wrapper={HubPageNavigationWrapper}>
                    <MainMenuView></MainMenuView>
                </NavigationProvider>
            </div>
        </div>
    )
}

export default HubPageComponent
