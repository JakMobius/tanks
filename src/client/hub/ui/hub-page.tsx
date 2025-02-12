import './hub-page.scss'

import {UserDataRaw} from "src/client/utils/user-data-raw";

import { NavigationProvider } from 'src/client/ui/navigation/navigation-view';
import MainMenuView from './main-menu/main-menu';
import React, { createContext, useContext } from 'react';

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

const ProfileContext = createContext<UserDataRaw | undefined>(undefined);

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (context === undefined) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
};

const HubPage: React.FC<HubPageProps> = (props) => {
    return (
        <ProfileContext.Provider value={props.userData}>
            <div className="hub-body">
                <div className="dimmer"></div>
                <div className="navigation-view">
                    <NavigationProvider wrapper={HubPageNavigationWrapper}>
                        <MainMenuView></MainMenuView>
                    </NavigationProvider>
                </div>
            </div>
        </ProfileContext.Provider>
    )
}

export default HubPage
