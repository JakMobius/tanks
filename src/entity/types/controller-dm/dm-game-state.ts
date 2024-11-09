import Entity from "src/utils/ecs/entity";

export enum DMGameStateType {
    waitingForPlayers,
    playing,
    matchOver
}

export type DMGameStateMatchOver = {
    state: DMGameStateType.matchOver
}

export type DMGameStatePlaying = {
    state: DMGameStateType.playing
    quickMatchEnd: boolean
}

export type DMGameStateWaitingForPlayers = {
    state: DMGameStateType.waitingForPlayers
    minPlayers: number
    currentPlayers: number
    timer: Entity
}

export type DMGameState = DMGameStateMatchOver | DMGameStatePlaying | DMGameStateWaitingForPlayers