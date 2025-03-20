import Entity from "src/utils/ecs/entity"

export enum RaceGameStateType {
    waitingForStart,
    playing,
    raceOver
}

export type RaceGameMatchOverState = {
    state: RaceGameStateType.raceOver
}

export type RaceGamePlayingState = {
    state: RaceGameStateType.playing
}

export type RaceGameStateWaitingForPlayers = {
    state: RaceGameStateType.waitingForStart
    timer: Entity
    isGassing: boolean
    playersGassing: number
    playersTotal: number
}

export type RaceGameState = RaceGameMatchOverState | RaceGamePlayingState | RaceGameStateWaitingForPlayers

export interface RaceGameEvent {
    checkpoint: number,
    totalCheckpoints: number,
    time: number
}