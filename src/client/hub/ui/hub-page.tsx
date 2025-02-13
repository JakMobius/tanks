import './hub-page.scss'

import {UserDataRaw} from "src/client/utils/user-data-raw";

import { NavigationProvider } from 'src/client/ui/navigation/navigation-view';
import MainMenuView from './main-menu/main-menu';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import NavigationEscapeHandler from 'src/client/ui/navigation/navigation-escape-handler';
import RootControlsResponder, { ControlsResponder } from 'src/client/controls/root-controls-responder';

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

    const [state] = useState({
        controlsResponder: useMemo(() => new ControlsResponder(), [])
    })

    useEffect(() => {
        RootControlsResponder.getInstance().setMainResponderDelayed(state.controlsResponder)
        return () => {
            RootControlsResponder.getInstance().setMainResponderDelayed(null)
        }
    }, [state.controlsResponder])

    return (
        <ProfileContext.Provider value={props.userData}>
            <div className="hub-body">
                <div className="dimmer"></div>
                <div className="navigation-view">
                    <NavigationProvider
                        rootComponent={<MainMenuView/>}
                        wrapper={HubPageNavigationWrapper}>
                        <NavigationEscapeHandler controls={state.controlsResponder}/>
                    </NavigationProvider>
                </div>
            </div>
        </ProfileContext.Provider>
    )
}

export default HubPage
