
import {DMGameState, DMGameStateMatchOver, DMGameStatePlaying, DMGameStateType, DMGameStateWaitingForPlayers} from "src/entity/types/controller-dm/dm-game-state";
import React, { useEffect, useState } from "react";
import Entity from "src/utils/ecs/entity";
import WorldStatisticsComponent from "src/entity/components/world-statistics/world-statistics-component";
import GameStateView from "../../../../client/ui/game-hud/game-state-view";
import TimerComponent from "src/entity/types/timer/timer-component";

interface WaitingStateViewProps extends DMGameStateHUDProps {
    state: DMGameStateWaitingForPlayers
}

const WaitingStateView: React.FC<WaitingStateViewProps> = (props) => {

    const [state, setState] = useState({
        mapName: null as string | null,
        refresh: {}
    })

    const updateMapName = () => {
        setState(state => ({
            ...state,
            mapName: props.world.getComponent(WorldStatisticsComponent).mapName
        }))
    }

    const onTimerTransmit = () => {
        setState(state => ({
            ...state,
            refresh: {}
        }))
    }

    useEffect(() => {
        if(!props.world) return undefined
        props.world.on("map-name-updated", updateMapName)
        updateMapName()
        return () => props.world.off("map-name-updated", updateMapName)
    }, [props.world])

    useEffect(() => {
        if(!props.state.timer) return undefined
        props.state.timer.on("timer-transmit", onTimerTransmit)
        onTimerTransmit()
        return () => props.state.timer.off("timer-transmit", onTimerTransmit)
    }, [props.state.timer])

    let currentPlayerCount = props.state.currentPlayers
    let requiredPlayerCount = props.state.minPlayers

    return (
        <GameStateView visibility="show" header={
            currentPlayerCount < requiredPlayerCount
                ? <span>Ожидание игроков <span className="player-count">{currentPlayerCount}/{requiredPlayerCount}</span></span>
                : <span>Игра начнется через {props.state.timer.getComponent(TimerComponent).formatTimeMinSec()}</span>
        }>
            {state.mapName}
        </GameStateView>
    )
}

interface MatchOverStateViewProps extends DMGameStateHUDProps {
    state: DMGameStateMatchOver
}

const MatchOverStateView: React.FC<MatchOverStateViewProps> = (props) => {
    const worldStatistics = props.world.getComponent(WorldStatisticsComponent).playerStatistics
    const singleWinner = worldStatistics.reduce((prev, current) => prev.score > current.score ? prev : current)
    const winnerScore = singleWinner.score

    const winners = worldStatistics.filter(team => team.score == winnerScore)

    const getWinners = () => {
        if (winnerScore == 0) {
            return "Никто не заработал очков. Великолепная игра."
        } else if(winners.length == 1) {
            return "Победил игрок " + singleWinner.name + "!"
        } else if(winners.length < 4 && winners.length < worldStatistics.length) {
            return "Победу разделили игроки " + winners.slice(0, -1).join(", ") + " и " + winners[winners.length - 1]
        } else {
            return "Ничья!"
        }
    }

    return (
        <GameStateView visibility="show" header="Матч окончен">
            {getWinners()}
        </GameStateView>
    )
}

interface PlayingStateViewProps extends DMGameStateHUDProps {
    state: DMGameStatePlaying
}

const PlayingStateView: React.FC<PlayingStateViewProps> = (props) => {

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
                timeLeftMessage = "До конца матча осталось " + timer.formatTimeMinSec()
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
            Матч будет завершен через {getTimer().formatTimeMinSec()}
        </GameStateView>
    )
    if(state.timeLeftMessage) return (
        <GameStateView visibility={state.visibility} header={state.timeLeftMessage}></GameStateView>
    )
    return <></>
}

interface DMGameStateHUDProps {
    state: DMGameState
    world: Entity
}

export const TDMGameStateHUD: React.FC<DMGameStateHUDProps> = (props) => {
    switch (props?.state.state) {
        case DMGameStateType.waitingForPlayers:
            return <WaitingStateView {...props as WaitingStateViewProps} />
        case DMGameStateType.matchOver:
            return <MatchOverStateView {...props as MatchOverStateViewProps} />
        case DMGameStateType.playing:
            return <PlayingStateView {...props as PlayingStateViewProps} />
        default:
            return <></>
    }
}