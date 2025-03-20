import {TDMGameState, TDMGameStateMatchOver, TDMGameStatePlaying, TDMGameStateType, TDMGameStateWaitingForPlayers} from "src/entity/types/controller-tdm/tdm-game-state";
import Entity from "src/utils/ecs/entity";
import React, { useEffect, useState } from "react";
import WorldStatisticsComponent from "src/entity/components/world-statistics/world-statistics-component";
import GameStateView from "../../../../client/ui/game-hud/game-state-view";
import TimerComponent from "src/entity/types/timer/timer-component";
import TeamColor from "src/utils/team-color";

interface WaitingStateViewProps extends TDMGameStateHUDProps {
    state: TDMGameStateWaitingForPlayers
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

interface PlayingStateViewProps extends TDMGameStateHUDProps {
    state: TDMGameStatePlaying
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

interface MatchOverStateViewProps extends TDMGameStateHUDProps {
    state: TDMGameStateMatchOver
}

const MatchOverStateView: React.FC<MatchOverStateViewProps> = (props) => {
    const teamStatistics = props.state.teamStatistics
    const singleWinner = teamStatistics.reduce((prev, current) => prev.score > current.score ? prev : current)
    const winnerScore = singleWinner.score

    const winners = teamStatistics.filter(team => team.score == winnerScore)

    const getWinners = () => {
        if (winnerScore == 0) {
            return "Никто не заработал очков. Великолепная игра."
        } else if(winners.length == 1) {
            return (
                <span color={TeamColor.getColor(singleWinner.team).code()}>
                    Победила команда {TeamColor.teamNames[singleWinner.team]}!
                </span>
            )
        } else if(winners.length < teamStatistics.length) {
            const winnerSpans = winners.map((team, index) => (<>
                {index > 0 && <>, </>}
                <span color={TeamColor.getColor(singleWinner.team).code()}>
                    {TeamColor.teamNames[team.team]}
                </span>
            </>))
            return (<>
                Победу разделили команды 
                {winnerSpans.slice(0, -1)} и {winnerSpans[winnerSpans.length - 1]}
            </>)
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

interface TDMGameStateHUDProps {
    state: TDMGameState
    world: Entity
}

export const TDMGameStateHUD: React.FC<TDMGameStateHUDProps> = (props) => {
    switch (props?.state.state) {
        case TDMGameStateType.waitingForPlayers:
            return <WaitingStateView {...props as WaitingStateViewProps} />
        case TDMGameStateType.matchOver:
            return <MatchOverStateView {...props as MatchOverStateViewProps} />
        case TDMGameStateType.playing:
            return <PlayingStateView {...props as PlayingStateViewProps} />
        default:
            return <></>
    }
}