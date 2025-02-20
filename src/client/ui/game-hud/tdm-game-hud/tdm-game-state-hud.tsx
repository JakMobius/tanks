import {TDMGameState, TDMGameStateType} from "src/entity/types/controller-tdm/tdm-game-state";
import TDMWaitingStateView from "src/client/ui/game-hud/tdm-game-hud/tdm-waiting-state-view";
import TDMMatchOverStateView from "src/client/ui/game-hud/tdm-game-hud/tdm-match-over-state-view";
import TDMPlayingStateView from "src/client/ui/game-hud/tdm-game-hud/tdm-playing-state-view";
import Entity from "src/utils/ecs/entity";
import React from "react";

interface TDMGameStateHUDProps {
    state: TDMGameState
    world: Entity
}

export const TDMGameStateHUD: React.FC<TDMGameStateHUDProps> = (props) => {
    switch (props?.state.state) {
        case TDMGameStateType.waitingForPlayers:
            return <TDMWaitingStateView state={props.state} world={props.world} />
        case TDMGameStateType.matchOver:
            return <TDMMatchOverStateView state={props.state}/>
        case TDMGameStateType.playing:
            return <TDMPlayingStateView state={props.state} world={props.world} />
        default:
            return <></>
    }
}