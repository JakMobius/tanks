import GameOverlay, {GameOverlayConfig} from "src/client/ui/overlay/game-overlay/game-overlay";
import {
    CTFGameData,
    CTFGameStateType
} from "src/entity/types/controller-ctf/ctf-game-state";
import CTFWaitingStateView from "src/client/ui/overlay/game-overlay/ctf-game-overlay/ctf-waiting-state-view";
import CTFPlayingStateView from "src/client/ui/overlay/game-overlay/ctf-game-overlay/ctf-playing-state-view";
import React from "react";
import CTFMatchOverStateView from "./ctf-match-over-state-view";
import Entity from "src/utils/ecs/entity";

interface CTFGameStateViewProps {
    state: CTFGameData
    world: Entity
}

const CTFGameStateView: React.FC<CTFGameStateViewProps> = (props) => {    
    switch (props?.state.state) {
        case CTFGameStateType.waitingForPlayers:
            return <CTFWaitingStateView state={props.state} world={props.world} />
        case CTFGameStateType.matchOver:
            return <CTFMatchOverStateView state={props.state}/>
        case CTFGameStateType.playing:
            return <CTFPlayingStateView state={props.state} world={props.world} />
        default:
            return <></>
    }
}

export default class CTFGameStateOverlay extends GameOverlay {
    setData(state: CTFGameData | null) {
        this.reactRoot.render(<CTFGameStateView state={state} world={this.world} />)
    }
}