import './authorized-welcome.scss'

import { ButtonComponent } from "src/client/ui/button/button";
import React from 'react';

interface LargePlayButtonProps {
    onClick?: () => void
}

const LargePlayButton: React.FC<LargePlayButtonProps> = (props) => {
    return (
        <div className="large-play-button" onClick={props.onClick}>
            <div className="upper-text">В БОЙ!</div>
            <div className="lower-text">Случайная игра</div>
        </div>
    );
}

interface AuthorizedWelcomeViewProps {
    onNavigateToRoomList?: () => void
}

const AuthorizedWelcomeView: React.FC<AuthorizedWelcomeViewProps> = (props) => {
    return (
        <div className="autorized-welcome-view">
            <LargePlayButton/>
            <ButtonComponent secondaryStyle onClick={props.onNavigateToRoomList}>Игровые комнаты</ButtonComponent>
        </div>
    );
}

export default AuthorizedWelcomeView;