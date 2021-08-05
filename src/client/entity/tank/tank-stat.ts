
export interface TankStat {
    // Average tank damage per second/shot
    damage: number

    // Maximum tank health
    health: number

    // Maximum tank speed
    speed: number

    // Amount of shots per second
    shootrate: number | undefined

    // Indicates how much time (in seconds) it take for weapon to reload
    reload: number | undefined

    [key: string]: number | undefined
}