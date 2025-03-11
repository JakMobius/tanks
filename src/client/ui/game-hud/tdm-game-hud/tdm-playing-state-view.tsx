import WorldStatisticsComponent from "src/entity/components/world-statistics/world-statistics-component";
import GameStateView from "src/client/ui/game-hud/game-state-view";
import Entity from "src/utils/ecs/entity";
import React, { useEffect, useState } from "react";
import { TDMGameStatePlaying } from "src/entity/types/controller-tdm/tdm-game-state";

interface TDMPlayingStateViewProps {
    world: Entity
    state: TDMGameStatePlaying
}

const TDMPlayingStateView: React.FC<TDMPlayingStateViewProps> = (props) => {

    const [state, setState] = useState({
        oldTimerValue: 0,
        timeLeftMessage: null as string | null,
        visibility: null as {} | null
    })

    const getTimer = () => {
        return props.world?.getComponent(WorldStatisticsComponent)?.getMatchLeftTimerComponent()
    }

    const onTimerTransmit = () => {
        const timer = getTimer()
        if(!timer) return

        setState(state => {
            let timeLeftMessage = null

            if(props.state.quickMatchEnd) {
                // Re-render
            } else if (timer.currentTime < 300 && state.oldTimerValue >= 300) {
                timeLeftMessage = "5 минут до конца матча"
            } else if (timer.currentTime < 60 && state.oldTimerValue >= 60) {
                timeLeftMessage ="1 минута до конца матча"
            } else if (timer.currentTime < 30 && state.oldTimerValue >= 30) {
                timeLeftMessage ="30 секунд до конца матча"
            } else if (timer.currentTime < 10) {
                timeLeftMessage = "До конца матча осталось " + timer.getMSTimeString()
            } else if (timer.currentTime < state.oldTimerValue) {
                return state // Do not trigger re-render
            }

            return {
                ...state,
                oldTimerValue: timer.currentTime,
                timeLeftMessage,
                visibility: {}
            }
        })
    }

    useEffect(() => {
        const matchTimer = getTimer()?.entity
        if(!matchTimer) return undefined

        matchTimer.on("timer-transmit", onTimerTransmit)
        onTimerTransmit()
        return () => matchTimer.off("timer-transmit", onTimerTransmit)
    }, [props.world])

    if(props.state.quickMatchEnd) return (
        <GameStateView visibility="show" header="Нет соперников">
            Матч будет завершен через {getTimer().getMSTimeString()}
        </GameStateView>
    )
    if(state.timeLeftMessage) return (
        <GameStateView visibility={state.visibility} header={state.timeLeftMessage}></GameStateView>
    )
    return <></>
}

export default TDMPlayingStateView