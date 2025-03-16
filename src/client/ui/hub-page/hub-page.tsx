import './hub-page.scss'

import {UserDataRaw} from "src/client/utils/user-data-raw";

import { NavigationProvider } from 'src/client/ui/navigation/navigation-view';
import MainMenuView from '../main-menu/main-menu';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import NavigationEscapeHandler from 'src/client/ui/navigation/navigation-escape-handler';
import EventsHUD, { EventsProvider } from 'src/client/ui/events-hud/events-hud';
import { ControlsProvider } from 'src/client/utils/react-controls-responder';

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
        <ControlsProvider autofocus>
            <EventsProvider>
                <ProfileContext.Provider value={props.userData}>
                    <div className="hub-body">
                        <div className="dimmer"></div>
                        <div className="navigation-view">
                            <NavigationProvider
                                rootComponent={<MainMenuView/>}
                                wrapper={HubPageNavigationWrapper}>
                                <NavigationEscapeHandler/>
                            </NavigationProvider>
                        </div>
                    </div>
                </ProfileContext.Provider>
                <EventsHUD/>
            </EventsProvider>
        </ControlsProvider>
    )
}

export default HubPage
