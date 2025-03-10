
import {
    CTFEventData,
    CTFGameState,
    CTFGameStateType
} from "src/entity/types/controller-ctf/ctf-game-state";
import CTFWaitingStateView from "src/client/ui/game-hud/ctf-game-hud/ctf-waiting-state-view";
import CTFPlayingStateView from "src/client/ui/game-hud/ctf-game-hud/ctf-playing-state-view";
import React from "react";
import CTFMatchOverStateView from "./ctf-match-over-state-view";
import Entity from "src/utils/ecs/entity";

interface CTFGameStateHUDProps {
    state?: CTFGameState
    event?: CTFEventData
    world: Entity
}

export const CTFGameStateHUD: React.FC<CTFGameStateHUDProps> = (props) => {    
    switch (props?.state.state) {
        case CTFGameStateType.waitingForPlayers:
            return <CTFWaitingStateView state={props.state} world={props.world} />
        case CTFGameStateType.matchOver:
            return <CTFMatchOverStateView state={props.state}/>
        case CTFGameStateType.playing:
            return <CTFPlayingStateView state={props.state} event={props.event} world={props.world} />
        default:
            return <></>
    }
}
