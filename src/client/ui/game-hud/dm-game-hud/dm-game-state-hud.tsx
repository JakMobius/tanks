
import {DMGameState, DMGameStateType} from "src/entity/types/controller-dm/dm-game-state";
import DMWaitingStateView from "src/client/ui/game-hud/dm-game-hud/dm-waiting-state-view";
import DMMatchOverStateView from "src/client/ui/game-hud/dm-game-hud/dm-match-over-state-view";
import DMPlayingStateView from "src/client/ui/game-hud/dm-game-hud/dm-playing-state-view";
import React from "react";
import Entity from "src/utils/ecs/entity";

interface DMGameStateHUDProps {
    state: DMGameState
    world: Entity
}

export const DMGameStateHUD: React.FC<DMGameStateHUDProps> = (props) => {
    switch (props?.state.state) {
        case DMGameStateType.waitingForPlayers:
            return <DMWaitingStateView state={props.state} world={props.world} />
        case DMGameStateType.matchOver:
            return <DMMatchOverStateView state={props.state} world={props.world}/>
        case DMGameStateType.playing:
            return <DMPlayingStateView state={props.state} world={props.world} />
        default:
            return <></>
    }
}