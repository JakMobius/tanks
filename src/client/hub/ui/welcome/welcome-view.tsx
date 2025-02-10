import './welcome.scss'

import {Tip, TipStyle} from "../input-tip-list/input-tip-list-view";
import {checkNick} from "src/data-checkers/nick-checker";
import {textFromNickCheckResult} from "src/client/hub/localizations";

import React, { useState } from 'react';
import HugeTitle from '../huge-title/huge-title';
import HugeTextInput from '../huge-text-input/huge-text-input';

const WelcomeView: React.FC = (props) => {

    const [state, setState] = useState({
        nick: "",
        tips: []
    })

    const handleInput = (value: string) => {
        let tips: Tip[] = checkNick(value).map(reason => {
            return {
                text: textFromNickCheckResult(reason),
                style: TipStyle.ERROR
            }
        })
        
        setState({
            nick: value,
            tips: tips
        })
    }

    return (
        <div className="welcome-view">
            <HugeTitle>Твой позывной?</HugeTitle>
            <HugeTextInput
                placeholder="Например, &quot;Уничтожитель 3000&quot;"
                button={{
                    text: "В атаку!",
                    onClick: () => { /* TODO */ }
                }}
                tips={state.tips}
                onChange={handleInput}
            />
        </div>
    );
}

export default WelcomeView;